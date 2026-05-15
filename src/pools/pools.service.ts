import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pool } from '../common/entities/pool.entity';
import { Position } from '../common/entities/position.entity';

@Injectable()
export class PoolsService {
  constructor(
    @InjectRepository(Pool) private pools: Repository<Pool>,
    @InjectRepository(Position) private positions: Repository<Position>,
  ) {}

  findAll() {
    return this.pools.find({ where: { active: true }, order: { poolId: 'ASC' } });
  }

  async findOne(poolId: number) {
    const pool = await this.pools.findOne({ where: { poolId } });
    if (!pool) throw new NotFoundException(`Pool ${poolId} not found`);
    return pool;
  }

  async getPosition(poolId: number, address: string) {
    const position = await this.positions.findOne({ where: { poolId, depositor: address } });
    return position ?? { poolId, depositor: address, balance: '0' };
  }
}
