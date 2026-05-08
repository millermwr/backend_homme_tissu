import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { VestesModule } from './vestes/vestes.module';
import { StorageModule } from './storage/storage.module';
import { AtelierModule } from './atelier/atelier.module';

@Module({
  imports: [DatabaseModule, AuthModule, VestesModule, StorageModule, AtelierModule],
})
export class AppModule {}
