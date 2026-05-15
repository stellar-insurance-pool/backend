import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessor } from '../common/entities/assessor.entity';

@Injectable()
export class AssessorsService {
  constructor(@InjectRepository(Assessor) private assessors: Repository<Assessor>) {}

  findAll() {
    return this.assessors.find({ where: { active: true }, order: { score: 'DESC' } });
  }

  async findOne(address: string) {
    const assessor = await this.assessors.findOne({ where: { address } });
    if (!assessor) throw new NotFoundException(`Assessor ${address} not found`);
    return assessor;
  }
}
