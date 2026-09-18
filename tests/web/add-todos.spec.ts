import { test, expect } from '@fixtures';
import { TODOS } from '@data/todos';

test.describe('W1 - Adicionar tarefas', () => {
  test('exibe as tarefas adicionadas e atualiza o contador de itens restantes', async ({
    todoPage,
  }) => {
    const todos = TODOS.shopping;

    await test.step('adiciona as tarefas', async () => {
      await todoPage.addTodos(todos);
    });

    await test.step('valida que as tarefas aparecem na ordem de inclusão', async () => {
      await expect(todoPage.items).toHaveCount(todos.length);
      await todoPage.expectVisibleTitles(todos);
    });

    await test.step('valida o contador "items left"', async () => {
      await todoPage.expectItemsLeft(todos.length);
    });

    await test.step('valida que o campo de texto é limpo após adicionar', async () => {
      await expect(todoPage.newTodoInput).toBeEmpty();
    });
  });
});
