import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';
import { Env } from './config/env.validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.enableCors({
    origin: config.get('CORS_ORIGIN', { infer: true }).split(','),
  });
  setupApp(app);

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('Auction House API').addBearerAuth().build(),
  );
  SwaggerModule.setup('docs', app, document);

  await app.listen(config.get('PORT', { infer: true }));
}
await bootstrap();
