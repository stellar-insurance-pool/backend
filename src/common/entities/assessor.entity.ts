import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('assessors')
export class Assessor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  address: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '100' })
  score: string;

  @Column({ default: 0 })
  totalVotes: number;

  @Column({ default: 0 })
  correctVotes: number;

  @Column({ type: 'decimal', precision: 20, scale: 7, default: '0' })
  stake: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  registeredAt: Date;
}
