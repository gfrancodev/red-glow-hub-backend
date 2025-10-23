import {
    LoginInput,
    LoginResponse,
    LogoutInput,
    LogoutResponse,
    RefreshInput,
    RefreshResponse,
    SignupInput,
    SignupResponse
} from '@/modules/auth/auth.schema';
import {
    BoostStatusResponse,
    CheckoutInput,
    CheckoutResponse
} from '@/modules/boost/boost.schema';
import {
    ContactInput,
    ContactResponse
} from '@/modules/contact/contact.schema';
import {
    PresignUploadInput,
    PresignUploadResponse
} from '@/modules/files/files.schema';
import {
    ListPlayersQuery,
    ListPlayersResponse,
    SearchQuery,
    SearchResponse,
    TrendingQuery,
    TrendingResponse
} from '@/modules/players/players.schema';
import {
    CreateMediaInput,
    MediaIdParam,
    UpdateMediaInput,
    UpdateProfileInput,
    UploadAvatarInput
} from '@/modules/profiles/profile.schema';
import {
    CreateReportInput,
    CreateReportResponse
} from '@/modules/reports/reports.schema';
import {
    GetPlayersByTagResponse,
    ListTagsResponse,
    getPlayersByTagParamsSchema,
    getPlayersByTagQuerySchema,
    listTagsQuerySchema
} from '@/modules/tags/tags.schema';
import {
    CallbackInput,
    CallbackResponse
} from '@/modules/uploads/uploads.schema';
import { z } from 'zod';

// Define paths using zod-openapi approach
export const paths = {
  '/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Criar nova conta',
      description: 'Registra um novo usuário na plataforma',
      requestBody: {
        content: {
          'application/json': {
            schema: SignupInput,
          },
        },
      },
      responses: {
        201: {
          description: 'Usuário criado com sucesso',
          content: {
            'application/json': {
              schema: SignupResponse,
            },
          },
        },
        400: {
          description: 'Dados inválidos',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
        409: {
          description: 'Email ou username já existe',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Fazer login',
      description: 'Autentica um usuário e retorna tokens de acesso',
      requestBody: {
        content: {
          'application/json': {
            schema: LoginInput,
          },
        },
      },
      responses: {
        200: {
          description: 'Login realizado com sucesso',
          content: {
            'application/json': {
              schema: LoginResponse,
            },
          },
        },
        401: {
          description: 'Credenciais inválidas',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Renovar token',
      description: 'Renova o token de acesso usando o refresh token',
      requestBody: {
        content: {
          'application/json': {
            schema: RefreshInput,
          },
        },
      },
      responses: {
        200: {
          description: 'Token renovado com sucesso',
          content: {
            'application/json': {
              schema: RefreshResponse,
            },
          },
        },
        401: {
          description: 'Refresh token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Fazer logout',
      description: 'Invalida a sessão do usuário',
      security: [{ BearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: LogoutInput,
          },
        },
      },
      responses: {
        200: {
          description: 'Logout realizado com sucesso',
          content: {
            'application/json': {
              schema: LogoutResponse,
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/me/boost/checkout': {
    post: {
      tags: ['Boost'],
      summary: 'Iniciar checkout de impulsionamento',
      description: 'Inicia o processo de pagamento para impulsionar o perfil',
      security: [{ BearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: CheckoutInput,
          },
        },
      },
      responses: {
        201: {
          description: 'Checkout iniciado com sucesso',
          content: {
            'application/json': {
              schema: CheckoutResponse,
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/me/boost': {
    get: {
      tags: ['Boost'],
      summary: 'Listar boosts do usuário',
      description: 'Retorna todos os boosts ativos e históricos do usuário',
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Lista de boosts retornada com sucesso',
          content: {
            'application/json': {
              schema: BoostStatusResponse,
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/contact/{username}': {
    post: {
      tags: ['Contact'],
      summary: 'Enviar contato para um player',
      description: 'Envia uma mensagem de contato para um player específico',
      requestParams: {
        path: z.object({
          username: z.string().describe('Username do player'),
        }),
      },
      requestBody: {
        content: {
          'application/json': {
            schema: ContactInput,
          },
        },
      },
      responses: {
        201: {
          description: 'Contato enviado com sucesso',
          content: {
            'application/json': {
              schema: ContactResponse,
            },
          },
        },
        400: {
          description: 'Dados inválidos',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
        404: {
          description: 'Player não encontrado',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/files/presign': {
    post: {
      tags: ['Files'],
      summary: 'Gerar URL pré-assinada para upload',
      description: 'Gera uma URL pré-assinada para upload de arquivos',
      security: [{ BearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: PresignUploadInput,
          },
        },
      },
      responses: {
        200: {
          description: 'URL pré-assinada gerada com sucesso',
          content: {
            'application/json': {
              schema: PresignUploadResponse,
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/reports': {
    post: {
      tags: ['Reports'],
      summary: 'Criar denúncia',
      description: 'Cria uma denúncia contra conteúdo ou usuário',
      requestBody: {
        content: {
          'application/json': {
            schema: CreateReportInput,
          },
        },
      },
      responses: {
        201: {
          description: 'Denúncia criada com sucesso',
          content: {
            'application/json': {
              schema: CreateReportResponse,
            },
          },
        },
        400: {
          description: 'Dados inválidos',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/uploads/callback': {
    post: {
      tags: ['Uploads'],
      summary: 'Callback de upload',
      description: 'Processa callback de upload com status e metadados',
      requestBody: {
        content: {
          'application/json': {
            schema: CallbackInput,
          },
        },
      },
      responses: {
        200: {
          description: 'Callback processado com sucesso',
          content: {
            'application/json': {
              schema: CallbackResponse,
            },
          },
        },
        400: {
          description: 'Dados inválidos',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/tags': {
    get: {
      tags: ['Tags'],
      summary: 'Listar tags',
      description: 'Lista todas as tags disponíveis',
      requestParams: {
        query: listTagsQuerySchema,
      },
      responses: {
        200: {
          description: 'Lista de tags retornada com sucesso',
          content: {
            'application/json': {
              schema: ListTagsResponse,
            },
          },
        },
      },
    },
  },

  '/tags/{slug}/players': {
    get: {
      tags: ['Tags'],
      summary: 'Buscar players por tag',
      description: 'Retorna players que possuem uma tag específica',
      requestParams: {
        path: getPlayersByTagParamsSchema,
        query: getPlayersByTagQuerySchema,
      },
      responses: {
        200: {
          description: 'Players encontrados com sucesso',
          content: {
            'application/json': {
              schema: GetPlayersByTagResponse,
            },
          },
        },
        404: {
          description: 'Tag não encontrada',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/players': {
    get: {
      tags: ['Players'],
      summary: 'Listar players',
      description: 'Lista players com filtros e paginação',
      requestParams: {
        query: ListPlayersQuery,
      },
      responses: {
        200: {
          description: 'Lista de players retornada com sucesso',
          content: {
            'application/json': {
              schema: ListPlayersResponse,
            },
          },
        },
      },
    },
  },

  '/players/search': {
    get: {
      tags: ['Players'],
      summary: 'Buscar players',
      description: 'Busca players e tags com termo de pesquisa',
      requestParams: {
        query: SearchQuery,
      },
      responses: {
        200: {
          description: 'Resultados da busca retornados com sucesso',
          content: {
            'application/json': {
              schema: SearchResponse,
            },
          },
        },
      },
    },
  },

  '/players/trending': {
    get: {
      tags: ['Players'],
      summary: 'Players em alta',
      description: 'Retorna players em alta (trending)',
      requestParams: {
        query: TrendingQuery,
      },
      responses: {
        200: {
          description: 'Players em alta retornados com sucesso',
          content: {
            'application/json': {
              schema: TrendingResponse,
            },
          },
        },
      },
    },
  },

  '/me/profile': {
    get: {
      tags: ['Profile'],
      summary: 'Obter perfil do usuário',
      description: 'Retorna o perfil do usuário autenticado',
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Perfil retornado com sucesso',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(true),
                data: z.object({
                  id: z.string(),
                  username: z.string(),
                  display_name: z.string(),
                  bio: z.string().optional(),
                  avatar_url: z.string().optional(),
                  state: z.string(),
                  city: z.string(),
                  contact_email: z.string().optional(),
                  whatsapp: z.string().optional(),
                  twitch: z.string().optional(),
                  youtube: z.string().optional(),
                  instagram: z.string().optional(),
                  created_at: z.string(),
                  updated_at: z.string(),
                }),
              }),
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
    put: {
      tags: ['Profile'],
      summary: 'Atualizar perfil do usuário',
      description: 'Atualiza o perfil do usuário autenticado',
      security: [{ BearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: UpdateProfileInput,
          },
        },
      },
      responses: {
        200: {
          description: 'Perfil atualizado com sucesso',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(true),
                data: z.object({
                  id: z.string(),
                  username: z.string(),
                  display_name: z.string(),
                  bio: z.string().optional(),
                  avatar_url: z.string().optional(),
                  state: z.string(),
                  city: z.string(),
                  contact_email: z.string().optional(),
                  whatsapp: z.string().optional(),
                  twitch: z.string().optional(),
                  youtube: z.string().optional(),
                  instagram: z.string().optional(),
                  updated_at: z.string(),
                }),
              }),
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/me/avatar/upload': {
    post: {
      tags: ['Profile'],
      summary: 'Upload de avatar',
      description: 'Gera URL pré-assinada para upload de avatar',
      security: [{ BearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: UploadAvatarInput,
          },
        },
      },
      responses: {
        200: {
          description: 'URL pré-assinada gerada com sucesso',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(true),
                data: z.object({
                  upload_url: z.string(),
                  key: z.string(),
                  public_url: z.string(),
                }),
              }),
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/me/avatar/confirm': {
    post: {
      tags: ['Profile'],
      summary: 'Confirmar upload de avatar',
      description: 'Confirma o upload do avatar e atualiza o perfil',
      security: [{ BearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: z.object({
              key: z.string().describe('Chave do arquivo no storage'),
            }),
          },
        },
      },
      responses: {
        200: {
          description: 'Avatar confirmado com sucesso',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(true),
                data: z.object({
                  id: z.string(),
                  username: z.string(),
                  display_name: z.string(),
                  avatar_url: z.string(),
                  updated_at: z.string(),
                }),
              }),
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/me/media': {
    post: {
      tags: ['Profile'],
      summary: 'Criar mídia',
      description: 'Cria uma nova mídia no perfil do usuário',
      security: [{ BearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: CreateMediaInput,
          },
        },
      },
      responses: {
        201: {
          description: 'Mídia criada com sucesso',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(true),
                data: z.object({
                  id: z.string(),
                  type: z.string(),
                  url: z.string(),
                  title: z.string().optional(),
                  tags: z.array(z.string()).optional(),
                  created_at: z.string(),
                }),
              }),
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },

  '/me/media/{media_id}': {
    patch: {
      tags: ['Profile'],
      summary: 'Atualizar mídia',
      description: 'Atualiza uma mídia do perfil do usuário',
      security: [{ BearerAuth: [] }],
      requestParams: {
        path: MediaIdParam,
      },
      requestBody: {
        content: {
          'application/json': {
            schema: UpdateMediaInput,
          },
        },
      },
      responses: {
        200: {
          description: 'Mídia atualizada com sucesso',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(true),
                data: z.object({
                  id: z.string(),
                  title: z.string().optional(),
                  tags: z.array(z.string()).optional(),
                  updated_at: z.string(),
                }),
              }),
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
        404: {
          description: 'Mídia não encontrada',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
    delete: {
      tags: ['Profile'],
      summary: 'Deletar mídia',
      description: 'Remove uma mídia do perfil do usuário',
      security: [{ BearerAuth: [] }],
      requestParams: {
        path: MediaIdParam,
      },
      responses: {
        200: {
          description: 'Mídia deletada com sucesso',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(true),
                message: z.string(),
              }),
            },
          },
        },
        401: {
          description: 'Token inválido',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
        404: {
          description: 'Mídia não encontrada',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().default(false),
                code: z.string(),
                error: z.object({
                  id: z.string(),
                  status: z.number(),
                  name: z.string(),
                  details: z.object({
                    timestamp: z.string(),
                    path: z.string(),
                    message: z.string(),
                  }),
                }),
              }),
            },
          },
        },
      },
    },
  },
};