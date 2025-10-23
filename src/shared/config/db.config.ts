import { logger } from '@/shared/core/logger';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient( {
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Log Prisma events
db.$on('query', e => {
  //logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Prisma query');
});

db.$on('info', e => {
  //logger.info({ message: e.message }, 'Prisma info');
});

db.$on('warn', e => {
  //logger.warn({ message: e.message }, 'Prisma warning');
});

db.$on('error', e => {
  //logger.error({ message: e.message }, 'Prisma error');
});

process.on('start', () => {
  //logger.info('Prisma connected');
  db.$connect()
    .then(() => {
      logger.info('Prisma connected');
    })
    .catch(error => {
      logger.error({ error }, 'Prisma connection failed');
    });
});

// Graceful shutdown
process.on('beforeExit', () => {
  void db.$disconnect();
});

export default db;
