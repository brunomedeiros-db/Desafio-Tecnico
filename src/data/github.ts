export const EXISTING_USER = 'octocat';

/**
 * Gera um username com formato VÁLIDO (letras, números e hífens simples, <= 39 chars),
 * mas que com certeza prática não existe. Usar um formato válido garante que o 404
 * vem de "usuário não encontrado", e não de uma rota/entrada malformada.
 */
export function nonExistentUsername(): string {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `qa-inexistente-${suffix}`.slice(0, 39);
}
