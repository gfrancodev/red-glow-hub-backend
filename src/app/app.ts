import { env } from '@/shared/config/env';
import { requestLogger } from '@/shared/core/logger';
import { corsConfig, helmetConfig, rateLimitConfig } from '@/shared/core/security';
import { errorInterceptor } from '@/shared/middleware/error-handler';
import { requestId } from '@/shared/middleware/request-id';
import { setupSwagger } from '@/shared/middleware/swagger';
import compression from 'compression';
import express from 'express';
import pinoHttp from 'pino-http';

// Import route modules
import authRoutes from '@/modules/auth/auth.controller';
import boostRoutes from '@/modules/boost/boost.controller';
import contactRoutes from '@/modules/contact/contact.controller';
import filesRoutes from '@/modules/files/files.controller';
import locationsRoutes from '@/modules/locations/locations.controller';
import playersRoutes from '@/modules/players/players.controller';
import profileRoutes from '@/modules/profiles/profile.controller';
import reportsRoutes from '@/modules/reports/reports.controller';
import sessionRoutes from '@/modules/session/session.controller';
import tagsRoutes from '@/modules/tags/tags.controller';
import uploadsRoutes from '@/modules/uploads/uploads.controller';
import webhooksRoutes from '@/modules/webhooks/webhooks.controller';

export function buildApp() {
  const app = express();

  // Security middleware
  app.use(helmetConfig);
  app.use(corsConfig);
  app.use(compression());

  // Request correlation
  app.use(requestId);

  // Logging
  app.use(
    pinoHttp({
      logger: requestLogger,
      genReqId: req => (req as { requestId?: string }).requestId ?? crypto.randomUUID(),
    })
  );

  // Body parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Rate limiting
  app.use(rateLimitConfig);

  // Health check
  app.get(`/${env.API_VERSION}/status/health`, (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: env.API_VERSION,
      },
    });
  });

  // Setup Swagger documentation
  setupSwagger(app);

  // API routes
  app.use(`/${env.API_VERSION}/auth`, authRoutes);
  app.use(`/${env.API_VERSION}/session`, sessionRoutes);
  app.use(`/${env.API_VERSION}/files`, filesRoutes);
  app.use(`/${env.API_VERSION}/uploads`, uploadsRoutes);
  app.use(`/${env.API_VERSION}/players`, playersRoutes);
  app.use(`/${env.API_VERSION}/tags`, tagsRoutes);
  app.use(`/${env.API_VERSION}/locations`, locationsRoutes);
  app.use(`/${env.API_VERSION}/contact`, contactRoutes);
  app.use(`/${env.API_VERSION}/reports`, reportsRoutes);
  app.use(`/${env.API_VERSION}/me`, profileRoutes);
  app.use(`/${env.API_VERSION}/me/boost`, boostRoutes);
  app.use(`/${env.API_VERSION}/webhooks`, webhooksRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      code: 'PL-0404',
      error: {
        id: crypto.randomUUID(),
        status: 404,
        name: 'Not Found',
        details: {
          timestamp: new Date().toISOString(),
          path: _req.originalUrl,
          message: 'Route not found',
        },
      },
    });
  });

  // Error handler (must be last)
  app.use(errorInterceptor);

  return app;
}
