import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('pools')
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  poolId: number;

  @Column()
  name: string;

  @Column()
  token: string;

  @Column({ type: 'decimal', precision: 20, scale: 7, default: '0' })
  reserveBalance: string;

  @Column()
  premiumRateBps: number;

  @Column()
  claimRatioBps: number;

  @Column({ default: 0 })
  totalMembers: number;

  @Column({ default: true })
  active: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
