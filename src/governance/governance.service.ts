import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal, ProposalStatus } from '../common/entities/proposal.entity';

export class CreateProposalDto {
  proposer: string;
  title: string;
  action: string;
  params?: Record<string, any>;
}

@Injectable()
export class GovernanceService {
  constructor(@InjectRepository(Proposal) private proposals: Repository<Proposal>) {}

  findAll() {
    return this.proposals.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(proposalId: number) {
    const proposal = await this.proposals.findOne({ where: { proposalId } });
    if (!proposal) throw new NotFoundException(`Proposal ${proposalId} not found`);
    return proposal;
  }

  async create(dto: CreateProposalDto) {
    const count = await this.proposals.count();
    return this.proposals.save(
      this.proposals.create({ ...dto, proposalId: count + 1, status: ProposalStatus.ACTIVE }),
    );
  }

  findActiveElections() {
    return this.proposals.find({
      where: { action: 'elect_assessor', status: ProposalStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }
}
