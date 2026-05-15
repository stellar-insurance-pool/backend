import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { ClaimStatus } from '../common/entities/claim.entity';

@ApiTags('claims')
@Controller('claims')
export class ClaimsController {
  constructor(private readonly service: ClaimsService) {}

  @Get()
  @ApiOperation({ summary: 'List claims (filter by claimant or status)' })
  @ApiQuery({ name: 'claimant', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ClaimStatus })
  findAll(
    @Query('claimant') claimant?: string,
    @Query('status') status?: ClaimStatus,
  ) {
    return this.service.findAll({ claimant, status });
  }

  @Get('queue')
  @ApiOperation({ summary: 'Voting queue — claims under review' })
  getQueue() {
    return this.service.getVotingQueue();
  }

  @Get(':claimId')
  @ApiOperation({ summary: 'Get claim detail with vote breakdown' })
  findOne(@Param('claimId', ParseIntPipe) claimId: number) {
    return this.service.findOne(claimId);
  }
}
