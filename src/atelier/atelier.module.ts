import { Module } from '@nestjs/common';
import { AtelierController } from './atelier.controller';
import { AtelierService } from './atelier.service';

@Module({
  controllers: [AtelierController],
  providers: [AtelierService],
})
export class AtelierModule {}
