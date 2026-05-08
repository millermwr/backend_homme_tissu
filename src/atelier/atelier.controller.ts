import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AtelierService } from './atelier.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@Controller()
export class AtelierController {
  constructor(private readonly atelierService: AtelierService) {}

  @Get('atelier/profile')
  getPublicProfile(): Promise<unknown> {
    return this.atelierService.getProfile();
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/atelier/profile')
  getAdminProfile(): Promise<unknown> {
    return this.atelierService.getProfile();
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/atelier/profile')
  updateProfile(
    @Body()
    body: {
      name?: string;
      welcomeText?: string;
      description?: string;
      phoneNumber?: string | null;
      logoLeftUrl?: string | null;
      logoRightUrl?: string | null;
    },
  ): Promise<unknown> {
    return this.atelierService.updateProfile(body);
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/atelier/upload-logo')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          const extension = path.extname(file.originalname);
          const baseName = path
            .basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9-_]/g, '-');
          cb(null, `${Date.now()}-logo-${baseName}${extension}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Le logo doit etre une image'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun logo recu');
    }

    return {
      mediaUrl: `/uploads/${file.filename}`,
      fileSize: file.size,
      originalName: file.originalname,
    };
  }
}
