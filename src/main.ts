import 'dotenv/config';
import { NestFactory }        from '@nestjs/core';
import { AppModule }          from './app.module';
import { ValidationPipe }     from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionFilter } from './common/filters/Htpp-emigration.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist:            true,
    forbidNonWhitelisted: false,
    transform:            true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.useGlobalFilters(new AllExceptionFilter());

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials:    true,
  });

  const config = new DocumentBuilder()
    .setTitle('ZFVV API')
    .setDescription('API para la gestión de tareas')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Servidor local')
    .addServer('https://zfvv-api.onrender.com', 'Servidor en Render')
    .addTag('tasks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();