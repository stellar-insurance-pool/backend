import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ClaimStatus {
  PENDING = 'Pending',
  UNDER_REVIEW = 'UnderReview',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PAID = 'Paid',
}

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  claimId: number;

  @Column()
  poolId: number;

  @Column()
  claimant: string;

  @Column({ type: 'decimal', precision: 20, scale: 7 })
  amount: string;

  @Column()
  evidenceHash: string;

  @Column({ nullable: true })
  evidenceUrl: string;

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.PENDING })
  status: ClaimStatus;

  @Column({ default: 0 })
  approvals: number;

  @Column({ default: 0 })
  rejections: number;

  @CreateDateColumn()
  submittedAt: Date;

  @Column({ nullable: true })
  paidAt: Date;
}
