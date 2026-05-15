import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssessorsService } from './assessors.service';

@ApiTags('assessors')
@Controller('assessors')
export class AssessorsController {
  constructor(private readonly service: AssessorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active assessors with reputation scores' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get individual assessor stats' })
  findOne(@Param('address') address: string) {
    return this.service.findOne(address);
  }
}
