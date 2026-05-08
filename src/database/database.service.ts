import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const connectionUrl =
      process.env.DATABASE_URL ||
      'postgresql://atelier_user:atelier_password@localhost:5432/atelier_couture';

    this.pool = new Pool({
      connectionString: connectionUrl,
      max: 10,
    });
  }

  private toPostgresQuery(text: string): string {
    let parameterIndex = 0;
    return text.replace(/\?/g, () => `$${++parameterIndex}`);
  }

  async onModuleInit() {
    const maxAttempts = 5;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const connection = await this.pool.connect();
        await connection.query('SELECT 1');
        connection.release();
        return;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }

    throw new Error(
      `Connexion PostgreSQL impossible apres ${maxAttempts} tentatives. Verifiez DATABASE_URL et demarrez PostgreSQL localement. Detail: ${String(lastError)}`,
    );
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T = any>(text: string, values: any[] = []): Promise<T[]> {
    const connection = await this.pool.connect();
    try {
      const { rows } = await connection.query<T>(this.toPostgresQuery(text), values);
      return rows;
    } finally {
      connection.release();
    }
  }

  async execute(text: string, values: any[] = []): Promise<number> {
    const connection = await this.pool.connect();
    try {
      const result = await connection.query(this.toPostgresQuery(text), values);
      return result.rowCount ?? 0;
    } finally {
      connection.release();
    }
  }
}
