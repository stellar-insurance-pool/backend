import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Pool } from '../common/entities/pool.entity';
import { Claim, ClaimStatus } from '../common/entities/claim.entity';
import { Position } from '../common/entities/position.entity';
import { Assessor } from '../common/entities/assessor.entity';
import { Vote } from '../common/entities/vote.entity';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);
  private lastLedger = 0;
  private polling = false;

  constructor(
    private config: ConfigService,
    @InjectRepository(Pool) private pools: Repository<Pool>,
    @InjectRepository(Claim) private claims: Repository<Claim>,
    @InjectRepository(Position) private positions: Repository<Position>,
    @InjectRepository(Assessor) private assessors: Repository<Assessor>,
    @InjectRepository(Vote) private votes: Repository<Vote>,
  ) {}

  onModuleInit() {
    const interval = this.config.get<number>('INDEXER_POLL_MS', 5000);
    setInterval(() => this.poll(), interval);
  }

  private get rpcUrl() {
    return this.config.get<string>('STELLAR_RPC_URL', 'https://soroban-testnet.stellar.org');
  }

  private get poolContract() {
    return this.config.get<string>('POOL_MANAGER_ID', '');
  }

  private get claimsContract() {
    return this.config.get<string>('CLAIMS_ENGINE_ID', '');
  }

  private async poll() {
    if (this.polling || !this.poolContract || !this.claimsContract) return;
    this.polling = true;
    try {
      await Promise.all([
        this.fetchEvents(this.poolContract, this.handlePoolEvent.bind(this)),
        this.fetchEvents(this.claimsContract, this.handleClaimEvent.bind(this)),
      ]);
    } catch (err) {
      this.logger.warn(`Indexer poll error: ${err.message}`);
    } finally {
      this.polling = false;
    }
  }

  private async fetchEvents(contractId: string, handler: (event: any) => Promise<void>) {
    const body = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getEvents',
      params: {
        startLedger: this.lastLedger,
        filters: [{ type: 'contract', contractIds: [contractId] }],
        pagination: { limit: 100 },
      },
    };

    const res = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    const events: any[] = json?.result?.events ?? [];

    for (const event of events) {
      await handler(event);
      if (event.ledger > this.lastLedger) this.lastLedger = event.ledger;
    }
  }

  private async handlePoolEvent(event: any) {
    const topic = this.decodeTopic(event.topic?.[0]);
    const data = event.value;

    switch (topic) {
      case 'POOL/created':
        await this.pools.upsert(
          {
            poolId: data.id,
            name: data.name,
            token: data.token,
            premiumRateBps: data.premium_rate_bps,
            claimRatioBps: data.claim_ratio_bps,
            reserveBalance: '0',
          },
          ['poolId'],
        );
        break;

      case 'POOL/deposit':
        await this.positions.upsert(
          { poolId: data.pool_id, depositor: data.depositor, balance: data.amount },
          ['poolId', 'depositor'],
        );
        await this.pools.increment({ poolId: data.pool_id }, 'totalMembers', 1);
        await this.updateReserve(data.pool_id, data.amount, '+');
        break;

      case 'POOL/withdraw':
        await this.updateReserve(data.pool_id, data.amount, '-');
        break;

      case 'POOL/premium':
        await this.updateReserve(data.pool_id, data.amount, '+');
        break;

      case 'POOL/payout':
        await this.updateReserve(data.pool_id, data.amount, '-');
        break;
    }
  }

  private async handleClaimEvent(event: any) {
    const topic = this.decodeTopic(event.topic?.[0]);
    const data = event.value;

    switch (topic) {
      case 'CLAIM/submit':
        await this.claims.upsert(
          {
            claimId: data.id,
            poolId: data.pool_id,
            claimant: data.claimant,
            amount: data.amount,
            evidenceHash: data.evidence_hash,
            status: ClaimStatus.PENDING,
          },
          ['claimId'],
        );
        break;

      case 'CLAIM/vote':
        await this.votes.save({
          claimId: data.claim_id,
          assessor: data.assessor,
          approved: data.approve,
        });
        if (data.approve) {
          await this.claims.increment({ claimId: data.claim_id }, 'approvals', 1);
        } else {
          await this.claims.increment({ claimId: data.claim_id }, 'rejections', 1);
        }
        break;

      case 'CLAIM/final':
        await this.claims.update(
          { claimId: data.claim_id },
          { status: data.approved ? ClaimStatus.APPROVED : ClaimStatus.REJECTED },
        );
        break;

      case 'CLAIM/paid':
        await this.claims.update(
          { claimId: data.claim_id },
          { status: ClaimStatus.PAID, paidAt: new Date() },
        );
        break;

      case 'ASSOR/reg':
        await this.assessors.upsert(
          { address: data.assessor, active: true },
          ['address'],
        );
        break;
    }
  }

  private async updateReserve(poolId: number, amount: string, op: '+' | '-') {
    const pool = await this.pools.findOne({ where: { poolId } });
    if (!pool) return;
    const current = parseFloat(pool.reserveBalance);
    const delta = parseFloat(amount);
    const next = op === '+' ? current + delta : current - delta;
    await this.pools.update({ poolId }, { reserveBalance: next.toFixed(7) });
  }

  private decodeTopic(raw: any): string {
    // Topics come as XDR symbol values; handle both string and object forms
    if (typeof raw === 'string') return raw;
    return raw?.value ?? '';
  }
}
