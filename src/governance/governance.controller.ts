import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GovernanceService, CreateProposalDto } from './governance.service';

@ApiTags('governance')
@Controller('governance')
export class GovernanceController {
  constructor(private readonly service: GovernanceService) {}

  @Get('proposals')
  @ApiOperation({ summary: 'List all governance proposals' })
  findAll() {
    return this.service.findAll();
  }

  @Post('proposals')
  @ApiOperation({ summary: 'Create a governance proposal' })
  create(@Body() dto: CreateProposalDto) {
    return this.service.create(dto);
  }

  @Get('proposals/:proposalId')
  @ApiOperation({ summary: 'Get proposal detail' })
  findOne(@Param('proposalId', ParseIntPipe) proposalId: number) {
    return this.service.findOne(proposalId);
  }

  @Get('elections')
  @ApiOperation({ summary: 'Active assessor elections' })
  elections() {
    return this.service.findActiveElections();
  }
}
