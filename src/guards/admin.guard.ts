import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWT_SECRET_KEY } from 'src/config';
import { Role } from '../users/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException(' Insufficient Permissions');

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: JWT_SECRET_KEY,
      });
      if (payload.role !== Role.ADMIN) {
        throw new UnauthorizedException('Insufficient Permissions');
      } else {
        request['user'] = payload;
        return true;
      }
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
