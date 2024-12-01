import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleGuard implements CanActivate{
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) return true;

    try {
    const request = context.switchToHttp().getRequest();

    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('No token');

      const decoded = this.jwtService.verify(token, { secret: 'at-secret' });
      //console.log('Decoded Token:', decoded);

      const userId = decoded.sub;
      //console.log('User ID:', userId);

      request.user = decoded;
      
      const user = await this.prisma.user.findFirst({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isAdmin = user.role;

      if (!isAdmin) {
        throw new ForbiddenException('You are not admin');
      }

      return true;
    } catch (err) {
      console.error('Token validation error:', err.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
