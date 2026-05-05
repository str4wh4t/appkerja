import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from './entities/unit.entity.js';
import { UnitsService } from './units.service.js';
import { UnitsQuery, UnitsMutation } from './resolvers/index.js';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  providers: [UnitsService, UnitsQuery, UnitsMutation],
  exports: [TypeOrmModule, UnitsService],
})
export class UnitsModule {}
