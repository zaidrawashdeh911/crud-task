import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AtStrategy, RtStrategy, JwtStrategy } from './strategies';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: 'at-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AtStrategy, RtStrategy,JwtAuthGuard,JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
