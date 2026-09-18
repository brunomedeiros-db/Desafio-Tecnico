import { type APIRequestContext, type APIResponse } from '@playwright/test';

/** Subconjunto dos campos de GET /users/{username} usados nas validações. */
export interface GithubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  html_url: string;
  type: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

/**
 * Client fino sobre o APIRequestContext do Playwright.
 * Mantém os testes focados em "o quê" validar, e não em "como" montar a requisição.
 */
export class GithubUsersClient {
  constructor(private readonly request: APIRequestContext) {}

  getUser(username: string): Promise<APIResponse> {
    return this.request.get(`/users/${encodeURIComponent(username)}`);
  }
}

/**
 * Detecta o rate limit do GitHub (403/429 com x-ratelimit-remaining = 0),
 * para que a falha tenha uma mensagem clara em vez de um "expected 200, received 403".
 */
export function rateLimitMessage(response: APIResponse): string | undefined {
  const headers = response.headers();
  const limited =
    [403, 429].includes(response.status()) && headers['x-ratelimit-remaining'] === '0';
  if (!limited) return undefined;

  const reset = Number(headers['x-ratelimit-reset']) * 1000;
  const resetAt = Number.isFinite(reset) ? new Date(reset).toISOString() : 'desconhecido';
  return (
    `Rate limit da API do GitHub atingido (reset em ${resetAt}). ` +
    'Aguarde alguns minutos ou defina GITHUB_TOKEN (opcional).'
  );
}
