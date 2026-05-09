import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { getUploadsDir } from './uploads-path';

@Injectable()
export class StorageService {
  constructor(private readonly db: DatabaseService) {}

  private async getUploadsDirectorySize(directoryPath: string): Promise<number> {
    let totalSize = 0;

    let entries;
    try {
      entries = await readdir(directoryPath, { withFileTypes: true });
    } catch {
      return 0;
    }

    for (const entry of entries) {
      const entryPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        totalSize += await this.getUploadsDirectorySize(entryPath);
        continue;
      }

      if (entry.isFile()) {
        const fileStats = await stat(entryPath);
        totalSize += fileStats.size;
      }
    }

    return totalSize;
  }

  async getStats() {
    let usedBytes = 0;

    try {
      const rows = await this.db.query<{ sum: number | null }>(
        'SELECT COALESCE(SUM(fileSize), 0) as sum FROM VesteImage',
      );
      usedBytes = Number(rows[0]?.sum ?? 0);
    } catch {
      usedBytes = await this.getUploadsDirectorySize(getUploadsDir());
    }

    const quotaMb = Number(process.env.STORAGE_QUOTA_MB ?? 1024);
    const quotaBytes = quotaMb * 1024 * 1024;
    const usagePercent =
      quotaBytes === 0 ? 0 : Math.min(100, (usedBytes / quotaBytes) * 100);

    return {
      usedBytes,
      quotaBytes,
      usagePercent: Number(usagePercent.toFixed(2)),
      usedMb: Number((usedBytes / 1024 / 1024).toFixed(2)),
      quotaMb,
    };
  }
}
