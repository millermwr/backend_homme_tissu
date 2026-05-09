import { Module } from '@nestjs/common';
import { AtelierController } from './atelier.controller';
import { AtelierService } from './atelier.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [AtelierController],
  providers: [AtelierService],
})
export class AtelierModule {}
