import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from '../common/entities/pool.entity';
import { Position } from '../common/entities/position.entity';
import { PoolsService } from './pools.service';
import { PoolsController } from './pools.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pool, Position])],
  providers: [PoolsService],
  controllers: [PoolsController],
})
export class PoolsModule {}
