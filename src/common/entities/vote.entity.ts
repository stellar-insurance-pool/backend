import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  claimId: number;

  @Column()
  assessor: string;

  @Column()
  approved: boolean;

  @CreateDateColumn()
  votedAt: Date;
}
