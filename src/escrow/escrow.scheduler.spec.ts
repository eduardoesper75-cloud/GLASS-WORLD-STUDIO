import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { EscrowScheduler } from './escrow.scheduler';
import { EscrowService } from './escrow.service';

describe('EscrowScheduler', () => {
  let scheduler: EscrowScheduler;
  const processPendingAutoReleases = jest.fn();
  const start = jest.fn();

  const SWEEP_JOB_NAME = 'escrow-pending-releases-sweep';

  const build = async (envEnabled?: string) => {
    if (envEnabled === undefined) delete process.env.ESCROW_SWEEP_ENABLED;
    else process.env.ESCROW_SWEEP_ENABLED = envEnabled;

    start.mockReset();
    processPendingAutoReleases.mockReset();
    processPendingAutoReleases.mockResolvedValue({
      processed: 3,
      released: 2,
      skipped: 1,
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        EscrowScheduler,
        {
          provide: EscrowService,
          useValue: { processPendingAutoReleases },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            getCronJob: jest.fn(() => ({ start })),
          },
        },
      ],
    }).compile();

    scheduler = moduleRef.get(EscrowScheduler);
    return scheduler;
  };

  afterEach(() => {
    delete process.env.ESCROW_SWEEP_ENABLED;
  });

  describe('activación condicional (onApplicationBootstrap)', () => {
    it('arranca el job cuando ESCROW_SWEEP_ENABLED=true', async () => {
      await build('true');
      jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
      scheduler.onApplicationBootstrap();
      expect(start).toHaveBeenCalledTimes(1);
    });

    it('NO arranca el job sin la variable (default apagado)', async () => {
      await build();
      jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
      scheduler.onApplicationBootstrap();
      expect(start).not.toHaveBeenCalled();
    });
  });

  describe('sweepPendingReleases()', () => {
    beforeEach(async () => {
      await build('true');
    });

    it('llama al sweep del servicio y devuelve el resumen del lote', async () => {
      await expect(scheduler.sweepPendingReleases()).resolves.toBeUndefined();
      expect(processPendingAutoReleases).toHaveBeenCalledTimes(1);
    });

    it('loguea el resumen cuando el servicio reporta liberaciones', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
      await scheduler.sweepPendingReleases();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('processed=3 released=2 skipped=1'),
      );
      logSpy.mockRestore();
    });

    it('no propaga el error de un tick fallido: lo loguea y deja el reintento al próximo tick', async () => {
      processPendingAutoReleases.mockRejectedValueOnce(new Error('DB caída'));
      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

      await expect(scheduler.sweepPendingReleases()).resolves.toBeUndefined();
      expect(processPendingAutoReleases).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('DB caída'),
        expect.any(String),
      );
      errorSpy.mockRestore();
    });
  });
});