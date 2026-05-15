import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndexerService } from './indexer.service';
import { Pool } from '../common/entities/pool.entity';
import { Claim } from '../common/entities/claim.entity';
import { Position } from '../common/entities/position.entity';
import { Assessor } from '../common/entities/assessor.entity';
import { Vote } from '../common/entities/vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pool, Claim, Position, Assessor, Vote])],
  providers: [IndexerService],
  exports: [IndexerService],
})
export class IndexerModule {}
