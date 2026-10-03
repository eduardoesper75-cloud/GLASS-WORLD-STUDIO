// B15: debe ser el PRIMER import. Setea UV_THREADPOOL_SIZE antes de que Node
// cargue bcrypt (addon nativo que usa el thread pool de libuv). Ver el
// archivo para el porqué del orden — no mover.
import { UV_THREADPOOL_SIZE } from './config/threadpool';
// eslint-disable-next-line no-console
console.log(`[B15] thread pool de libuv configurado en ${UV_THREADPOOL_SIZE} threads`);

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // trust proxy (gws-security-hardening): el backend corre detrás de un
  // proxy/reverse (AWS ALB/ELB en producción, dev detras del puerto
  // local). Sin esto, req.ip es la IP del proxy (o 127.0.0.1) y el rate
  // limiting del Throttler queda mal calculado: todos los usuarios se
  // ven como la misma IP y/o un atacante rota IPs reales que el proxy
  // sí ve. Ajustar la cantidad de saltos al patrón real de despliegue.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 1));

  // Helmet: cabeceras de seguridad HTTP estándar (HSTS, X-Content-Type-Options,
  // CSP base, frame denials, etc.). Primera capa anti-cabecera de navegadores.
  app.use(helmet());

  // whitelist:true descarta cualquier campo no declarado en los DTOs —
  // primera línea de defensa contra mass-assignment (ver
  // gws-security-hardening). forbidNonWhitelisted bloquea con 400 en vez
  // de ignorar silenciosamente. transform habilita conversión de tipos y
  // trim/whitespace de strings en los DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' });

  // GWS · OpenAPI (FASE 10) — contrato documentado-first de la API.
  // DocumentBuilder arma el esquema OpenAPI 3.0. SwaggerUI se sirve en
  // /api/docs (JSON en /api/docs-json). Los tags agrupan por dominio y
  // addBearerAuth habilita "Authorize" con el JWT de /auth/login.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Glass World Studio API')
    .setDescription('API del marketplace vertical del vidrio')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación')
    .addTag('orders', 'Órdenes y checkout')
    .addTag('marketplace', 'Catálogo y productos')
    .addTag('escrow', 'Sistema de retención de fondos')
    .addTag('vault', 'Bóveda del conocimiento')
    .addTag('subscriptions', 'Planes y suscripciones')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`GWS backend corriendo en http://localhost:${port}`);
  console.log('OpenAPI disponible en /api/docs (JSON: /api/docs-json)');
}
bootstrap();
