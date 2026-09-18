import { test as base } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';
import { GithubUsersClient } from '../api/GithubUsersClient';

type Fixtures = {
  todoPage: TodoPage;
  githubUsers: GithubUsersClient;
};

/**
 * Fixtures customizadas: cada teste recebe o Page Object / client já prontos.
 * O todoPage já abre a aplicação, então os testes começam direto no cenário.
 */
export const test = base.extend<Fixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },
  githubUsers: async ({ request }, use) => {
    await use(new GithubUsersClient(request));
  },
});

export { expect } from '@playwright/test';
