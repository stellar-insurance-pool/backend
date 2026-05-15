import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from '../common/entities/claim.entity';
import { Vote } from '../common/entities/vote.entity';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Claim, Vote])],
  providers: [ClaimsService],
  controllers: [ClaimsController],
})
export class ClaimsModule {}
