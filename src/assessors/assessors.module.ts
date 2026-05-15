import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessor } from '../common/entities/assessor.entity';
import { AssessorsService } from './assessors.service';
import { AssessorsController } from './assessors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Assessor])],
  providers: [AssessorsService],
  controllers: [AssessorsController],
})
export class AssessorsModule {}
