import { type Locator, type Page, expect } from '@playwright/test';

export type TodoFilter = 'All' | 'Active' | 'Completed';

/**
 * Page Object do TodoMVC.
 * Seletores priorizam atributos estáveis e acessíveis (placeholder, role, data-testid)
 * em vez de classes CSS, que tendem a mudar com mais facilidade.
 */
export class TodoPage {
  readonly newTodoInput: Locator;
  readonly items: Locator;
  readonly titles: Locator;
  readonly counter: Locator;

  constructor(private readonly page: Page) {
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.titles = page.getByTestId('todo-title');
    this.counter = page.getByTestId('todo-count');
  }

  async goto(): Promise<void> {
    // baseURL já aponta para /todomvc/, por isso o caminho relativo vazio
    await this.page.goto('');
    await expect(this.newTodoInput).toBeVisible();
  }

  async addTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  async addTodos(titles: readonly string[]): Promise<void> {
    for (const title of titles) {
      await this.addTodo(title);
    }
  }

  itemByTitle(title: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('todo-title').getByText(title, { exact: true }),
    });
  }

  async complete(title: string): Promise<void> {
    await this.itemByTitle(title).getByRole('checkbox').check();
  }

  async filterBy(filter: TodoFilter): Promise<void> {
    await this.page.getByRole('link', { name: filter, exact: true }).click();
  }

  /** Espera o texto do contador no formato do app: "1 item left" / "2 items left". */
  async expectItemsLeft(count: number): Promise<void> {
    const label = count === 1 ? 'item' : 'items';
    await expect(this.counter).toHaveText(`${count} ${label} left`);
  }

  async expectVisibleTitles(titles: readonly string[]): Promise<void> {
    await expect(this.titles).toHaveText([...titles]);
  }
}
