import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  poolId: number;

  @Column()
  depositor: string;

  @Column({ type: 'decimal', precision: 20, scale: 7, default: '0' })
  balance: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
