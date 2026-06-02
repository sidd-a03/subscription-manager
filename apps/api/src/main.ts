import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const isProduction = process.env.NODE_ENV === "production";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: isProduction ? ["error", "warn",] : ["error", "warn", "log", "debug", "verbose"],

  });
  app.enableCors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix("api");

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Subscription Management')
      .setDescription('Subscription Management API description')
      .setVersion('1.0')
      .addTag('Subscription Management')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory, {
      useGlobalPrefix: true
    });
  }

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
