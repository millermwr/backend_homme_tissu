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
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../storage/cloudinary.service';

@Controller()
export class AtelierController {
  constructor(
    private readonly atelierService: AtelierService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
      storage: memoryStorage(),
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
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun logo recu');
    }

    const uploadResult = await this.cloudinaryService.uploadBuffer(file.buffer, {
      folder: 'atelier/logos',
      resourceType: 'image',
    });

    return {
      mediaUrl: uploadResult.mediaUrl,
      mediaPublicId: uploadResult.mediaPublicId,
      fileSize: uploadResult.fileSize,
      originalName: file.originalname,
    };
  }
}
