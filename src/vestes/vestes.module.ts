import { Module } from '@nestjs/common';
import { VestesController } from './vestes.controller';
import { VestesService } from './vestes.service';

@Module({
  controllers: [VestesController],
  providers: [VestesService],
})
export class VestesModule {}
