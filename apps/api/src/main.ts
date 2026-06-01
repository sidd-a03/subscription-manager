import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

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
  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
