import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService, CloudinaryService],
  exports: [CloudinaryService],
})
export class StorageModule {}
