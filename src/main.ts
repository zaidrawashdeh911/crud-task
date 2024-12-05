import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  //same solution in app.module.ts
  //const reflector = new Reflector();
  //app.useGlobalGuards(new AtGuard(reflector));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
