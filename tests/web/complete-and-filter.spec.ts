import { test, expect } from '@fixtures';
import { TODOS } from '@data/todos';

test.describe('W2 - Concluir e filtrar', () => {
  test('tarefa concluída aparece em Completed e não em Active', async ({ todoPage }) => {
    const todos = TODOS.shopping;
    const [done, ...pending] = todos;

    await todoPage.addTodos(todos);

    await test.step(`conclui "${done}"`, async () => {
      await todoPage.complete(done);
      await expect(todoPage.itemByTitle(done)).toHaveClass(/completed/);
      await todoPage.expectItemsLeft(pending.length);
    });

    await test.step('filtro Active: só pendentes, sem a concluída', async () => {
      await todoPage.filterBy('Active');
      await todoPage.expectVisibleTitles(pending);
      await expect(todoPage.itemByTitle(done)).toHaveCount(0);
    });

    await test.step('filtro Completed: só a concluída', async () => {
      await todoPage.filterBy('Completed');
      await todoPage.expectVisibleTitles([done]);
    });

    await test.step('filtro All: todas as tarefas', async () => {
      await todoPage.filterBy('All');
      await todoPage.expectVisibleTitles(todos);
    });
  });
});
