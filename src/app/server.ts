import { env } from '@/shared/config/env';
import { logger } from '@/shared/core/logger';
import { createServer } from 'http';
import { buildApp } from './app';

export function startServer() {
  const app = buildApp();
  const server = createServer(app);

  const port = env.PORT;

  server.listen(port, () => {
    logger.info({ port, version: env.API_VERSION }, 'Server started');
  });

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal');

    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return server;
}
