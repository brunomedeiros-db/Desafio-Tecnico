import { test, expect } from '@fixtures';
import { rateLimitMessage, type GithubUser } from '@api/GithubUsersClient';
import { EXISTING_USER, nonExistentUsername } from '@data/github';

test.describe('GitHub REST - GET /users/{username}', () => {
  test('A1 - usuário válido retorna 200 e os campos esperados', async ({ githubUsers }) => {
    const response = await githubUsers.getUser(EXISTING_USER);

    expect(rateLimitMessage(response), rateLimitMessage(response)).toBeUndefined();
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = (await response.json()) as GithubUser;

    // Contrato: presença e tipo dos campos principais
    expect(body).toMatchObject({
      login: expect.any(String),
      id: expect.any(Number),
      node_id: expect.any(String),
      avatar_url: expect.stringMatching(/^https:\/\//),
      html_url: expect.any(String),
      type: expect.any(String),
      public_repos: expect.any(Number),
      followers: expect.any(Number),
      following: expect.any(Number),
      created_at: expect.any(String),
    });

    // Valores: só o que é estável (contagens como public_repos podem mudar)
    expect(body.login.toLowerCase()).toBe(EXISTING_USER);
    expect(body.type).toBe('User');
    expect(body.html_url).toBe(`https://github.com/${body.login}`);
    expect(body.public_repos).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(Date.parse(body.created_at))).toBe(false);
  });

  test('A2 - usuário inexistente retorna 404', async ({ githubUsers }) => {
    const username = nonExistentUsername();
    const response = await githubUsers.getUser(username);

    expect(rateLimitMessage(response), rateLimitMessage(response)).toBeUndefined();
    expect(response.status(), `usuário usado: ${username}`).toBe(404);

    const body = await response.json();
    expect(body).toMatchObject({ message: 'Not Found' });
  });
});
