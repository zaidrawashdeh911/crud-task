import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './common/guards';
import { TaskModule } from './tasks/task.module';

@Module({
  imports: [PrismaModule,AuthModule, TaskModule],
  //controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard
    }
  ],
})
export class AppModule {}
