import { Module } from '@nestjs/common';
import { VestesController } from './vestes.controller';
import { VestesService } from './vestes.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [VestesController],
  providers: [VestesService],
})
export class VestesModule {}
