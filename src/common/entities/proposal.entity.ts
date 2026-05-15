import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ProposalStatus {
  ACTIVE = 'Active',
  PASSED = 'Passed',
  REJECTED = 'Rejected',
  EXECUTED = 'Executed',
}

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  proposalId: number;

  @Column()
  proposer: string;

  @Column()
  title: string;

  @Column()
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  params: Record<string, any>;

  @Column({ default: 0 })
  yesVotes: number;

  @Column({ default: 0 })
  noVotes: number;

  @Column({ type: 'enum', enum: ProposalStatus, default: ProposalStatus.ACTIVE })
  status: ProposalStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  executedAt: Date;
}
