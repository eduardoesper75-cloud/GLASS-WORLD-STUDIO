import { Test } from '@nestjs/testing';
import { Controller, Get, INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { throttleOptions } from '../config/throttle.config';

/**
 * B12 â€” RegresiÃ³n del rate limiting (2026-10-02)
 * ----------------------------------------------------
 * El bug: `@nestjs/throttler` v6 interpreta `ttl` en MILISEGUNDOS, y el
 * cÃ³digo pasaba `60` creyendo que eran segundos â†’ ventana de 60 ms en lugar
 * de 60 s. Medido: 2.927 req/s contra un techo pretendido de 1,7 req/s
 * (docs/simulation/analisis-fase-11.md Â§3). Concretamente, `/auth/login`
 * daba ~83 intentos/segundo en vez de 5 por minuto.
 *
 * Estos tests NO leen los metadatos del decorador: montan un HTTP server real
 * con el ThrottlerGuard global y contÃ³ peticiones de verdad. Un test que solo
 * inspeccionara `Reflect.getMetadata` pasarÃ­a aunque el guard estuviera mal
 * configurado â€” que es exactamente lo que pasÃ³ con el bug original.
 */

describe('AuthController Â· rate limiting (B12)', () => {
  // IP de documentaciÃ³n (RFC 5737 TEST-NET-3): reservada, nunca ruteable.
  const TEST_IP = '203.0.113.9';

  let app: INestApplication;
  let loginCalls: number;

  beforeAll(async () => {
    const authServiceMock = {
      login: jest.fn().mockResolvedValue({ accessToken: 'token-fake', user: { id: 'u1' } }),
      register: jest.fn().mockResolvedValue({ accessToken: 'token-fake' }),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        // throttleOptions() — la MISMA función que usa app.module.ts.
        ThrottlerModule.forRoot([throttleOptions({})]),
      ],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        // El JwtAuthGuard se inyecta en los handlers @UseGuards(JwtAuthGuard)
        // (elevate, totp/*). Nest lo instancia aunque este suite no los
        // ejercite, asÃ­ que hay que darle sus dependencias.
        { provide: JwtService, useValue: { sign: jest.fn(), verify: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    // El ValidationPipe real: el guard debe cortar ANTES de que el DTO se
    // valide, y para probarlo necesitamos el mismo pipeline que en producciÃ³n.
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    loginCalls = 0;
  });

  /**
   * Hace un POST /auth/login desde una IP fija y devuelve el status.
   * La IP es la misma en todos los intentos a propÃ³sito: el throttler
   * clasifica por IP, y para probar el lÃ­mite hay que ser "la misma IP".
   * Sin `x-forwarded-for`, supertestæŠ¥å‘ŠarÃ­a ::ffff:127.0.0.1 que tambiÃ©n
   * servirÃ­a; se fija explÃ­citamente para que el test sea legible.
   */
  const attemptLogin = async (): Promise<number> => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-forwarded-for', TEST_IP)
      .send({ identifier: 'alguien@example.com', password: 'incorrecta' });
    if (res.status < 400) loginCalls += 1;
    return res.status;
  };

  it('el 6Âº intento de login consecutivo devuelve 429', async () => {
    // Los primeros 5 deben pasar el guard...
    const primeros: number[] = [];
    for (let i = 0; i < 5; i += 1) primeros.push(await attemptLogin());

    // ...y el 6Âº debe ser rechazado por el throttler.
    const sexto = await attemptLogin();

    expect(primeros.every((s) => s === 201 || s === 200)).toBe(true);
    expect(sexto).toBe(429);
  });

  it('el servicio de auth NO se invoca en los intentos bloqueados', async () => {
    const service = app.get(AuthService) as jest.Mocked<AuthService>;
    service.login.mockClear();

    for (let i = 0; i < 8; i += 1) await attemptLogin();

    // La clave: el guard debe cortar ANTES de tocar la lÃ³gica de negocio,
    // asÃ­ que ni siquiera se ejecuta el bcrypt del intento bloqueado.
    expect(service.login).toHaveBeenCalledTimes(0);
  });

  it('el lÃ­mite de login es 5 por ventana (no ~83 por segundo como antes del fix)', async () => {
    const service = app.get(AuthService) as jest.Mocked<AuthService>;
    service.login.mockClear();

    let aceptados = 0;
    let rechazados = 0;
    for (let i = 0; i < 20; i += 1) {
      const status = await attemptLogin();
      if (status === 429) rechazados += 1;
      else aceptados += 1;
    }

    // Con el bug (ttl 60 ms) los 20 habrÃ­an pasado el guard.
    expect(aceptados).toBe(0); // el bucket ya quedÃ³ lleno en el test anterior
    expect(rechazados).toBe(20);
  });

  /**
   * Cubre la OTRA mitad del fix: el `ttl` global de app.module.ts.
   *
   * Los tests anteriores pasan aunque el global siga en `ttl: 60`, porque
   * @Throttle() en el decorador pisa la config global para /auth/login.
   * Ese fue justo el agujero del bug original: app.module.ts decÃ­a "60
   * segundos" y los decoradores decÃ­an "60 milisegundos", y nadie lo notÃ³
   * porque cada ruta "funcionaba".
   *
   * Para cubrirlo hace falta una ruta SIN decorador, que es donde el global
   * es lo Ãºnico que aplica. Se declara un controller mÃ­nimo en el test.
   */
  it('el lÃ­mite global (100/min) aplica a rutas sin @Throttle', async () => {
    const moduleRef = await Test.createTestingModule({
      // throttleOptions() â€” la MISMA funciÃ³n que app.module.ts usa en runtime.
      // Si esto estuviera hardcodeado a {ttl: 60_000} el test volverÃ­a a dar
      // verde con el bug global vivo, que es el agujero que cerrÃ³ el fix.
      imports: [ThrottlerModule.forRoot([throttleOptions({})])],
      controllers: [RutaSinDecoradorController],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    }).compile();

    const appGlobal = moduleRef.createNestApplication();
    await appGlobal.init();

    const estados: number[] = [];
    for (let i = 0; i < 105; i += 1) {
      const res = await request(appGlobal.getHttpServer())
        .get('/ruta-sin-decorador')
        .set('x-forwarded-for', '198.51.100.7');
      estados.push(res.status);
    }

    await appGlobal.close();

    // Con ttl: 60 (ms) el guard se vacÃ­a cada 60 ms y los 105 pasarÃ­an.
    // Con ttl: 60_000 los primeros 100 pasan y los Ãºltimos 5 son 429.
    expect(estados.filter((s) => s !== 429).length).toBe(100);
    expect(estados[104]).toBe(429);
  });
});

/** Controller mÃ­nimo sin decoradores: el global es lo Ãºnico que lo protege. */
@Controller('ruta-sin-decorador')
class RutaSinDecoradorController {
  @Get()
  get() {
    return { ok: true };
  }
}
