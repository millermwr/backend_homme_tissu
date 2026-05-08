import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

interface AtelierProfileRecord {
  id: number;
  name: string;
  welcomeText: string;
  description: string;
  phoneNumber: string | null;
  logoLeftUrl: string | null;
  logoRightUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UpdateAtelierProfilePayload {
  name?: string;
  welcomeText?: string;
  description?: string;
  phoneNumber?: string | null;
  logoLeftUrl?: string | null;
  logoRightUrl?: string | null;
}

@Injectable()
export class AtelierService implements OnModuleInit {
  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS AtelierProfile (
        id INT PRIMARY KEY,
        name TEXT NOT NULL,
        welcomeText TEXT NOT NULL DEFAULT 'Bienvenue chez Homme Tissus Couture',
        description TEXT NOT NULL,
        phoneNumber VARCHAR(20),
        logoLeftUrl TEXT,
        logoRightUrl TEXT,
        createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.db.execute(
      'ALTER TABLE AtelierProfile ADD COLUMN IF NOT EXISTS welcomeText TEXT',
    );

    await this.db.execute(
      'ALTER TABLE AtelierProfile ADD COLUMN IF NOT EXISTS phoneNumber VARCHAR(20)',
    );

    await this.db.execute(
      `
      UPDATE AtelierProfile
      SET welcomeText = 'Bienvenue chez Homme Tissus Couture'
      WHERE welcomeText IS NULL OR TRIM(welcomeText) = ''
      `,
    );

    await this.db.execute(
      `
      INSERT INTO AtelierProfile (id, name, welcomeText, description, logoLeftUrl, logoRightUrl, createdAt, updatedAt)
      VALUES (1, ?, ?, ?, ?, ?, ?::timestamptz, ?::timestamptz)
      ON CONFLICT (id) DO NOTHING
      `,
      [
        'Homme Tissus Couture',
        'Bienvenue chez Homme Tissus Couture',
        'Nous creons des vestes sur mesure avec un style elegant, une finition soignee et des matieres de qualite.',
        '/uploads/1775122141002-logo-IMG-20260401-WA0010.jpg',
        '/uploads/1775122141026-logo-IMG-20260401-WA0010.jpg',
        '2026-04-02 09:21:45.000',
        '2026-04-02 10:49:50.000',
      ],
    );
  }

  async getProfile() {
    const rows = await this.db.query<AtelierProfileRecord>(
      'SELECT id, name, welcomeText, description, phoneNumber, logoLeftUrl, logoRightUrl, createdAt, updatedAt FROM AtelierProfile WHERE id = 1 LIMIT 1',
    );

    if (rows[0]) {
      return rows[0];
    }

    await this.db.execute(
      `
      INSERT INTO AtelierProfile (id, name, welcomeText, description, logoLeftUrl, logoRightUrl, createdAt, updatedAt)
      VALUES (1, ?, ?, ?, NULL, NULL, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
      `,
      [
        'Homme Tissus Couture',
        'Bienvenue chez Homme Tissus Couture',
        'Nous creons des vestes sur mesure avec un style elegant, une finition soignee et des matieres de qualite.',
      ],
    );

    const insertedRows = await this.db.query<AtelierProfileRecord>(
      'SELECT id, name, welcomeText, description, phoneNumber, logoLeftUrl, logoRightUrl, createdAt, updatedAt FROM AtelierProfile WHERE id = 1 LIMIT 1',
    );

    return insertedRows[0];
  }

  async updateProfile(payload: UpdateAtelierProfilePayload) {
    const current = await this.getProfile();

    if (!current) {
      throw new BadRequestException('Profil atelier introuvable');
    }

    const nextName =
      payload.name !== undefined ? payload.name.trim() : current.name;
    const nextWelcomeText =
      payload.welcomeText !== undefined
        ? payload.welcomeText.trim()
        : current.welcomeText;
    const nextDescription =
      payload.description !== undefined
        ? payload.description.trim()
        : current.description;
    const nextLogoLeftUrl =
      payload.logoLeftUrl !== undefined
        ? payload.logoLeftUrl
        : current.logoLeftUrl;
    const nextLogoRightUrl =
      payload.logoRightUrl !== undefined
        ? payload.logoRightUrl
        : current.logoRightUrl;
    const nextPhoneNumber =
      payload.phoneNumber !== undefined
        ? payload.phoneNumber
        : current.phoneNumber;

    if (!nextName) {
      throw new BadRequestException("Le nom de l'atelier est requis");
    }

    if (!nextDescription) {
      throw new BadRequestException("La description de l'atelier est requise");
    }

    if (!nextWelcomeText) {
      throw new BadRequestException('Le mot de bienvenue est requis');
    }

    await this.db.execute(
      `
      UPDATE AtelierProfile
      SET
        name = ?,
        welcomeText = ?,
        description = ?,
        phoneNumber = ?,
        logoLeftUrl = ?,
        logoRightUrl = ?,
        updatedAt = NOW()
      WHERE id = 1
      `,
      [
        nextName,
        nextWelcomeText,
        nextDescription,
        nextPhoneNumber,
        nextLogoLeftUrl,
        nextLogoRightUrl,
      ],
    );

    const rows = await this.db.query<AtelierProfileRecord>(
      'SELECT id, name, welcomeText, description, phoneNumber, logoLeftUrl, logoRightUrl, createdAt, updatedAt FROM AtelierProfile WHERE id = 1 LIMIT 1',
    );

    return rows[0];
  }
}
