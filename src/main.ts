import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger as pinoLogger } from 'nestjs-pino';
import { AllExceptionFilter } from './shared/filters/all-exception.filter';
import { AllSuccessResponseFilter } from './shared/filters/all-success.filter';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const origins = process.env.ORIGINS
    ? process.env.ORIGINS.replace(/\s+/g, '').split(',')
    : [];
  const port = process.env.PORT ?? 3000;
  const corsOption = {
    origin: function (origin, callback) {
      if (!origin || origins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  Logger.log(`Allowed origins: ${origins.join(', ')}`);

  app.useLogger(app.get(pinoLogger));
  app.use(cookieParser());
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors(corsOption);
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalInterceptors(new AllSuccessResponseFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port, () => Logger.log(`Dalla backend is up on: ${port}.`));
}
bootstrap();
