import { createOpenAPIDocument } from '@/shared/config/openapi';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

export function setupSwagger(app: any) {
  const router = Router();
  
  // Create OpenAPI document
  const openApiDocument = createOpenAPIDocument();
  
  // Swagger UI options
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6 }
    `,
    customSiteTitle: 'Player API Documentation',
  };

  // Serve OpenAPI JSON
  router.get('/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiDocument);
  });

  // Serve Swagger UI
  router.use('/', swaggerUi.serve);
  router.get('/', swaggerUi.setup(openApiDocument, swaggerOptions));

  // Mount swagger routes
  app.use('/api-docs', router);
  
  return router;
}
