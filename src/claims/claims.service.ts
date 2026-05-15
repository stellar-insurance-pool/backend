import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim, ClaimStatus } from '../common/entities/claim.entity';
import { Vote } from '../common/entities/vote.entity';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim) private claims: Repository<Claim>,
    @InjectRepository(Vote) private votes: Repository<Vote>,
  ) {}

  findAll(filters: { claimant?: string; status?: ClaimStatus }) {
    const where: any = {};
    if (filters.claimant) where.claimant = filters.claimant;
    if (filters.status) where.status = filters.status;
    return this.claims.find({ where, order: { submittedAt: 'DESC' } });
  }

  async findOne(claimId: number) {
    const claim = await this.claims.findOne({ where: { claimId } });
    if (!claim) throw new NotFoundException(`Claim ${claimId} not found`);
    const votes = await this.votes.find({ where: { claimId } });
    return { ...claim, votes };
  }

  getVotingQueue() {
    return this.claims.find({
      where: { status: ClaimStatus.UNDER_REVIEW },
      order: { submittedAt: 'ASC' },
    });
  }
}
