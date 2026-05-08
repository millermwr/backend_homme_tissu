import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { StorageService } from './storage.service';

@Controller('admin/storage')
@UseGuards(AdminAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('stats')
  getStats() {
    return this.storageService.getStats();
  }
}
