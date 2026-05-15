import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from './common/entities/pool.entity';
import { Claim } from './common/entities/claim.entity';
import { Position } from './common/entities/position.entity';
import { Assessor } from './common/entities/assessor.entity';
import { Vote } from './common/entities/vote.entity';
import { Proposal } from './common/entities/proposal.entity';
import { IndexerModule } from './indexer/indexer.module';
import { PoolsModule } from './pools/pools.module';
import { ClaimsModule } from './claims/claims.module';
import { AssessorsModule } from './assessors/assessors.module';
import { IpfsModule } from './ipfs/ipfs.module';
import { GovernanceModule } from './governance/governance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USER', 'postgres'),
        password: cfg.get('DB_PASS', 'postgres'),
        database: cfg.get('DB_NAME', 'insurance_pool'),
        entities: [Pool, Claim, Position, Assessor, Vote, Proposal],
        synchronize: true,
      }),
    }),
    IndexerModule,
    PoolsModule,
    ClaimsModule,
    AssessorsModule,
    IpfsModule,
    GovernanceModule,
  ],
})
export class AppModule {}
