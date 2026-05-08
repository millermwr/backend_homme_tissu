import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private getJwtSecret() {
    return process.env.JWT_SECRET || 'atelier-secret-change-me';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }

    const token = authHeader.slice(7);

    try {
      const payload = jwt.verify(token, this.getJwtSecret()) as unknown as {
        sub: number;
        email: string;
        role: string;
      };
      request.admin = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
