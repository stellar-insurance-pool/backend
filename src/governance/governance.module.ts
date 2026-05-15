import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from '../common/entities/proposal.entity';
import { GovernanceService } from './governance.service';
import { GovernanceController } from './governance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal])],
  providers: [GovernanceService],
  controllers: [GovernanceController],
})
export class GovernanceModule {}
