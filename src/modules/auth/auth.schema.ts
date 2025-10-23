import { z } from 'zod';

export const SignupInput = z.object({
  email: z.string().email().describe('Email do usuário'),
  password: z.string().min(8).max(128).describe('Senha (8-128 caracteres)'),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .describe('Username único (3-30 caracteres, apenas letras, números, _ e -)'),
  display_name: z.string().min(1).max(100).describe('Nome de exibição'),
  state: z.string().length(2).describe('UF (2 caracteres)'),
  city: z.string().min(1).max(100).describe('Cidade'),
  city_slug: z.string().optional().describe('Slug da cidade (opcional)'),
});

export const LoginInput = z.object({
  email: z.string().email().describe('Email do usuário'),
  password: z.string().min(1).describe('Senha'),
});

export const RefreshInput = z.object({
  refresh_token: z.string().min(1).describe('Token de refresh'),
});

export const LogoutInput = z.object({
  refresh_token: z.string().optional().describe('Token de refresh (opcional)'),
});

// Response schemas
export const AuthTokensResponse = z.object({
  access_token: z.string().describe('Token de acesso JWT'),
  refresh_token: z.string().describe('Token de refresh'),
  expires_in: z.number().describe('Tempo de expiração em segundos'),
});

export const UserResponse = z.object({
  id: z.string().describe('ID do usuário'),
  email: z.string().describe('Email do usuário'),
  username: z.string().describe('Username'),
  display_name: z.string().describe('Nome de exibição'),
  role: z.string().describe('Papel do usuário'),
  status: z.string().describe('Status da conta'),
  created_at: z.string().describe('Data de criação'),
});

export const SignupResponse = z.object({
  success: z.boolean().default(true),
  data: z.object({
    user: UserResponse,
    tokens: AuthTokensResponse,
  }),
});

export const LoginResponse = z.object({
  success: z.boolean().default(true),
  data: z.object({
    user: UserResponse,
    tokens: AuthTokensResponse,
  }),
});

export const RefreshResponse = z.object({
  success: z.boolean().default(true),
  data: z.object({
    tokens: AuthTokensResponse,
  }),
});

export const LogoutResponse = z.object({
  success: z.boolean().default(true),
  message: z.string().describe('Mensagem de confirmação'),
});

export type SignupInputType = z.infer<typeof SignupInput>;
export type LoginInputType = z.infer<typeof LoginInput>;
export type RefreshInputType = z.infer<typeof RefreshInput>;
export type LogoutInputType = z.infer<typeof LogoutInput>;
