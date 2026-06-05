import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe, cleanupOpenApiDoc } from 'nestjs-zod';
import cookieParser from 'cookie-parser';

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: isProduction
      ? ['error', 'warn']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.use(cookieParser());

  const allowedOrigin = process.env.FRONTEND_URL || true;

  app.enableCors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-client-type'],
  });

  app.useGlobalPipes(new ZodValidationPipe());

  app.setGlobalPrefix('api');

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Subscription Management')
      .setDescription('Subscription Management API description')
      .setVersion('1.0')
      .addTag('Subscription Management')
      .addBearerAuth()
      .addCookieAuth('refresh_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'refresh_token',
        description: 'Refresh token cookie',
      })
      .build();

    const documentFactory = () =>
      cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));
    SwaggerModule.setup('docs', app, documentFactory, {
      useGlobalPrefix: true,
    });
  }
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
