import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  const query = jest.fn();

  const build = async (dbOk: boolean) => {
    query.mockReset();
    if (dbOk) query.mockResolvedValue([{ '?column?': 1 }]);
    else query.mockRejectedValue(new Error('DB caída'));

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    controller = moduleRef.get(HealthController);
    return controller;
  };

  it('responde status ok + db ok cuando SELECT 1 funciona', async () => {
    await build(true);
    const report = await controller.health();
    expect(report).toEqual({
      status: 'ok',
      db: 'ok',
      version: '1.0.0',
      timestamp: expect.any(String),
    });
    expect(new Date(report.timestamp).toISOString()).toBe(report.timestamp);
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('reporta db error (sin lanzar) cuando la DB está caída', async () => {
    await build(false);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const report = await controller.health();
    expect(report).toEqual({
      status: 'degraded',
      db: 'error',
      version: '1.0.0',
      timestamp: expect.any(String),
    });
  });

  it('expone el alias /api/health con el mismo reporte', async () => {
    await build(true);
    await expect(controller.apiHealth()).resolves.toEqual(
      expect.objectContaining({ status: 'ok', db: 'ok' }),
    );
  });
});