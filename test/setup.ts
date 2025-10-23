import { afterAll, beforeAll } from 'vitest';

beforeAll(async () => {
  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = 'test';
  
  // Database
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/player_test';
  
  // JWT Secrets
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-purposes-only-32-chars';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-for-testing-purposes-only-32-chars';
  
  // Redis
  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  
  // Cloudflare R2 (test values)
  process.env.R2_ENDPOINT = process.env.R2_ENDPOINT || 'https://test.r2.cloudflarestorage.com';
  process.env.R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'test-access-key-id';
  process.env.R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'test-secret-access-key';
  process.env.R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'test-bucket-name';
  
  // Mercado Pago (test values)
  process.env.MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'test-mercadopago-access-token';
  
  // API Configuration
  process.env.API_VERSION = process.env.API_VERSION || 'v1';
  process.env.PORT = process.env.PORT || '3000';
  
  // Optional
  process.env.HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET || 'test-hcaptcha-secret';
  
  // Configurar rate limiting mais permissivo para testes
  process.env.RATE_LIMIT_WINDOW_MS = '60000'; // 1 minuto
  process.env.RATE_LIMIT_MAX = '1000'; // 1000 requests por minuto

  // eslint-disable-next-line no-console
  console.log('✅ Configuração de teste inicializada com Supertest');
});

afterAll(async () => {
  // Cleanup simplificado do banco de dados após todos os testes
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const seedUserEmails = [
      'admin@test.com',
      'moderator@test.com',
      'player@test.com',
      'inactive@test.com',
    ];

    // Estratégia simplificada: deletar tudo que não é seed
    // Sem transação para evitar conflitos
    // 1. Marcar todas as sessões como inativas para usuários não-seed
    await prisma.session.updateMany({
      where: {
        user: {
          email: {
            not: {
              in: seedUserEmails,
            },
          },
        },
        status: 'active',
      },
      data: { status: 'inactive' },
    });

    // 2. Deletar entidades relacionadas em ordem correta (dependências primeiro)
    // Deletar mídia primeiro (depende de profile)
    await prisma.media.deleteMany({
      where: {
        player: {
          user: {
            email: {
              not: {
                in: seedUserEmails,
              },
            },
          },
        },
      },
    });

    // Deletar sessions (depende de user)
    await prisma.session.deleteMany({
      where: {
        user: {
          email: {
            not: {
              in: seedUserEmails,
            },
          },
        },
      },
    });

    // Deletar profiles (depende de user)
    await prisma.profile.deleteMany({
      where: {
        user: {
          email: {
            not: {
              in: seedUserEmails,
            },
          },
        },
      },
    });

    // Deletar outras entidades relacionadas
    await Promise.all([
      // Deletar entidades que dependem de profile
      prisma.contact_event.deleteMany({
        where: {
          player: {
            user: {
              email: {
                not: {
                  in: seedUserEmails,
                },
              },
            },
          },
        },
      }),
      prisma.featured_assignment.deleteMany({
        where: {
          player: {
            user: {
              email: {
                not: {
                  in: seedUserEmails,
                },
              },
            },
          },
        },
      }),
      prisma.player_tag.deleteMany({
        where: {
          player: {
            user: {
              email: {
                not: {
                  in: seedUserEmails,
                },
              },
            },
          },
        },
      }),
      prisma.strike.deleteMany({
        where: {
          player: {
            user: {
              email: {
                not: {
                  in: seedUserEmails,
                },
              },
            },
          },
        },
      }),
      prisma.media.deleteMany({
        where: {
          player: {
            user: {
              email: {
                not: {
                  in: seedUserEmails,
                },
              },
            },
          },
        },
      }),
      prisma.boost.deleteMany({
        where: {
          player: {
            user: {
              email: {
                not: {
                  in: seedUserEmails,
                },
              },
            },
          },
        },
      }),
      // Deletar entidades que dependem de user
      prisma.user_note.deleteMany({
        where: {
          OR: [
            {
              player: {
                user: {
                  email: {
                    not: {
                      in: seedUserEmails,
                    },
                  },
                },
              },
            },
            {
              author: {
                email: {
                  not: {
                    in: seedUserEmails,
                  },
                },
              },
            },
          ],
        },
      }),
      prisma.report.deleteMany({
        where: {
          OR: [
            {
              profile_target: {
                user: {
                  email: {
                    not: {
                      in: seedUserEmails,
                    },
                  },
                },
              },
            },
            {
              reporter_user: {
                email: {
                  not: {
                    in: seedUserEmails,
                  },
                },
              },
            },
          ],
        },
      }),
      prisma.support_ticket.deleteMany({
        where: {
          OR: [
            {
              user: {
                email: {
                  not: {
                    in: seedUserEmails,
                  },
                },
              },
            },
            {
              assignee: {
                email: {
                  not: {
                    in: seedUserEmails,
                  },
                },
              },
            },
          ],
        },
      }),
    ]);

    // 3. Por último, deletar usuários não-seed
    await prisma.user.deleteMany({
      where: {
        email: {
          not: {
            in: seedUserEmails,
          },
        },
      },
    });

    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('🧹 Banco de dados limpo após os testes');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ Erro ao limpar banco de dados:', error);
  }
}, 60000); // Aumentar timeout para 60 segundos

// beforeEach temporariamente desabilitado devido a conflitos de transação no MongoDB
// beforeEach(async () => {
//   // Limpar dados de teste antes de cada teste
//   try {
//     const { PrismaClient } = await import('@prisma/client');
//     const prisma = new PrismaClient();

//     const seedUserEmails = [
//       'admin@test.com',
//       'moderator@test.com',
//       'player@test.com',
//       'inactive@test.com',
//     ];

//     // Usar transação para garantir consistência
//     await prisma.$transaction(async (tx) => {
//       // Primeiro, deletar sessões de usuários não-seed
//       await tx.session.deleteMany({
//         where: {
//           user: {
//             email: {
//               not: {
//                 in: seedUserEmails,
//               },
//             },
//           },
//         },
//       });

//       // Depois, deletar profiles de usuários não-seed
//       await tx.profile.deleteMany({
//         where: {
//           user: {
//             email: {
//               not: {
//                 in: seedUserEmails,
//               },
//             },
//           },
//         },
//       });

//       // Por último, deletar usuários não-seed
//       await tx.user.deleteMany({
//         where: {
//           email: {
//             not: {
//               in: seedUserEmails,
//             },
//           },
//         },
//       });
//     });

//     await prisma.$disconnect();
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.warn('⚠️ Erro ao limpar dados de teste:', error);
//   }
// });
