import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VestesService } from './vestes.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { getUploadsDir } from '../storage/uploads-path';

const uploadsDir = getUploadsDir();
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@Controller()
export class VestesController {
  constructor(private readonly vestesService: VestesService) {}

  @Get('vestes')
  getPublicCatalog(): Promise<unknown> {
    return this.vestesService.findPublic();
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/vestes')
  getAdminCatalog(): Promise<unknown> {
    return this.vestesService.findAdmin();
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/vestes/upload')
  @UseInterceptors(
    FileInterceptor('media', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          const extension = path.extname(file.originalname);
          const baseName = path
            .basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9-_]/g, '-');
          cb(null, `${Date.now()}-${baseName}${extension}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.startsWith('image/') &&
          !file.mimetype.startsWith('video/')
        ) {
          cb(
            new BadRequestException(
              'Le fichier doit etre une image ou une video',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadMedia(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier recu');
    }

    return {
      mediaUrl: `/uploads/${file.filename}`,
      mediaType: file.mimetype.startsWith('video/') ? 'video' : 'image',
      fileSize: file.size,
      originalName: file.originalname,
    };
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/vestes')
  create(
    @Body()
    body: {
      titre: string;
      description: string;
    },
  ): Promise<unknown> {
    if (!body.titre || !body.description) {
      throw new BadRequestException('Titre et description requis');
    }

    return this.vestesService.create(body);
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/vestes/:id/images')
  addImage(
    @Param('id', ParseIntPipe) vesteId: number,
    @Body() body: { mediaUrl: string; mediaType: string; fileSize: number },
  ): Promise<unknown> {
    if (!body.mediaUrl || !body.mediaType) {
      throw new BadRequestException('mediaUrl et mediaType requis');
    }

    return this.vestesService.addImage(
      vesteId,
      body.mediaUrl,
      body.mediaType,
      body.fileSize || 0,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Delete('admin/images/:id')
  removeImage(@Param('id', ParseIntPipe) imageId: number): Promise<unknown> {
    return this.vestesService.removeImage(imageId);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/vestes/:id/publish')
  publish(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isPublished: boolean },
  ): Promise<unknown> {
    return this.vestesService.setPublished(id, Boolean(body.isPublished));
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/vestes/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { titre: string; description: string },
  ): Promise<unknown> {
    if (!body.titre || !body.description) {
      throw new BadRequestException('Titre et description requis');
    }

    return this.vestesService.update(id, {
      titre: body.titre.trim(),
      description: body.description.trim(),
    });
  }

  @UseGuards(AdminAuthGuard)
  @Delete('admin/vestes/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vestesService.remove(id);
  }
}
