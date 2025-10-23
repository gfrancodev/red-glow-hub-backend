import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import { paths } from './routes';

// Common Response Schemas
const ErrorResponse = z.object({
  success: z.boolean().default(false),
  code: z.string().describe('Código do erro (ex: PL-0400)'),
  error: z.object({
    id: z.string().describe('ID único do erro'),
    status: z.number().describe('Status HTTP'),
    name: z.string().describe('Nome do erro'),
    details: z.object({
      timestamp: z.string().describe('Timestamp do erro'),
      path: z.string().describe('Caminho da requisição'),
      message: z.string().describe('Mensagem do erro'),
    }).passthrough(),
  }),
});

const SuccessResponse = z.object({
  success: z.boolean().default(true),
  data: z.any().describe('Dados da resposta'),
});

// Tags
const tags = [
  {
    name: 'Auth',
    description: 'Autenticação e autorização',
  },
  {
    name: 'Session',
    description: 'Gerenciamento de sessões',
  },
  {
    name: 'Files',
    description: 'Upload e gerenciamento de arquivos',
  },
  {
    name: 'Uploads',
    description: 'Callbacks de upload',
  },
  {
    name: 'Players',
    description: 'Descoberta e busca de players',
  },
  {
    name: 'Tags',
    description: 'Gerenciamento de tags',
  },
  {
    name: 'Locations',
    description: 'Localização e geografia',
  },
  {
    name: 'Contact',
    description: 'Contato entre players',
  },
  {
    name: 'Reports',
    description: 'Denúncias e moderação',
  },
  {
    name: 'Profile',
    description: 'Perfil do usuário autenticado',
  },
  {
    name: 'Boost',
    description: 'Impulsionamento de perfis',
  },
  {
    name: 'Webhooks',
    description: 'Webhooks para integrações',
  },
];

// Create OpenAPI Document
export const createOpenAPIDocument = () => {
  return createDocument({
    openapi: '3.0.0',
    info: {
      title: 'Player API',
      version: '1.0.0',
      description: 'API para plataforma de players com autenticação, perfis, mídia e descoberta',
      contact: {
        name: 'Player Team',
        email: 'contato@player.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000/v1',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://api.player.com/v1',
        description: 'Servidor de produção',
      },
    ],
    security: [
      {
        BearerAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token para autenticação',
        },
      },
      schemas: {
        ErrorResponse,
        SuccessResponse,
      },
    },
    tags,
    paths,
  });
};

export { ErrorResponse, SuccessResponse };
