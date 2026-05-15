import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PoolsService } from './pools.service';

@ApiTags('pools')
@Controller('pools')
export class PoolsController {
  constructor(private readonly service: PoolsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active pools' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':poolId')
  @ApiOperation({ summary: 'Get pool detail' })
  findOne(@Param('poolId', ParseIntPipe) poolId: number) {
    return this.service.findOne(poolId);
  }

  @Get(':poolId/positions/:address')
  @ApiOperation({ summary: 'Get LP position for address in pool' })
  getPosition(
    @Param('poolId', ParseIntPipe) poolId: number,
    @Param('address') address: string,
  ) {
    return this.service.getPosition(poolId, address);
  }
}
