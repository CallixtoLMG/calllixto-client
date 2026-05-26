import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import { waitForEntityDetailUrl } from "./support/entities";

const listUrl = /\/gastos(?:\?|$)/;

type ExpenseFixture = {
  name: string;
  amount: string;
  comments: string;
  tagsCount?: number;
};

const openExpensesList = async (page: Page) => {
  await page.goto("/gastos");
  await expect(page).toHaveURL(listUrl);
  await expect(page.getByTestId("nav-action-crear")).toBeVisible();
};

const selectFirstRequiredCategory = async (page: Page) => {
  const categoriesDropdown = page.getByTestId("dropdown-categories");
  await expect(categoriesDropdown).toBeVisible();
  await categoriesDropdown.click();

  const options = page
    .locator('[role="option"]')
    .filter({ visible: true })
    .filter({ hasNotText: /todos|no hay|no se encontraron/i });

  if (!(await options.count())) {
    throw new Error("Expense E2E requires at least one configured expense category in settings.");
  }

  const category = options.nth(0);
  const selectedCategory = (await category.innerText()).trim();
  await category.click();

  return selectedCategory;
};

const selectAvailableTags = async (page: Page, requestedCount = 2) => {
  const selectedTags: string[] = [];
  const tagsDropdown = page.getByTestId("dropdown-tags");

  if (!(await tagsDropdown.isVisible({ timeout: 5_000 }).catch(() => false))) {
    return selectedTags;
  }

  await tagsDropdown.click();

  const options = () => page
    .locator('[role="option"]')
    .filter({ visible: true })
    .filter({ hasNotText: /todos|no hay|no se encontraron/i });

  if (!(await options().count())) {
    await page.keyboard.press("Escape");
    return selectedTags;
  }

  for (let index = 0; index < requestedCount; index += 1) {
    const currentOptions = options();
    if (!(await currentOptions.count())) {
      break;
    }

    const option = currentOptions.nth(0);
    const text = (await option.innerText()).trim();
    selectedTags.push(text);
    await option.click();
  }

  return selectedTags;
};

const fillExpenseForm = async (page: Page, expense: ExpenseFixture) => {
  await page.locator('input[name="name"]').fill(expense.name);
  await page.getByPlaceholder("18000").fill(expense.amount);

  // The datepicker is intentionally left with its default date. Changing it through
  // react-datepicker would add fragile selector coupling without improving this smoke flow.
  const selectedCategory = await selectFirstRequiredCategory(page);

  const selectedTags = expense.tagsCount
    ? await selectAvailableTags(page, expense.tagsCount)
    : [];

  await page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2").fill(expense.comments);

  return {
    selectedCategory,
    selectedTags,
  };
};

const createExpense = async (page: Page, expense: ExpenseFixture) => {
  await openExpensesList(page);
  await page.getByTestId("nav-action-crear").click();
  await expect(page).toHaveURL(/\/gastos\/crear(?:\?|$)/);

  const selectedData = await fillExpenseForm(page, expense);

  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await waitForEntityDetailUrl(page, "gastos");

  return {
    url: page.url(),
    ...selectedData,
  };
};

const expectExpenseName = async (page: Page, name: string) => {
  await expect(page.getByTestId("expense-name-field")).toContainText(name, { timeout: 30_000 });
};

const voidCurrentExpense = async (page: Page, reason: string) => {
  await page.getByTestId("nav-action-anular").click();
  await page.getByPlaceholder(/motivo/i).fill(reason);
  await page.getByTestId("modal-void").click({ force: true });
  await expect(page.getByText(reason)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("nav-action-anular")).toBeHidden();
};

const voidExpenseIfPresent = async (page: Page, expenseUrl: string, reason: string) => {
  try {
    await page.goto(expenseUrl);

    const voidButton = page.getByTestId("nav-action-anular");
    if (!(await voidButton.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return;
    }

    await voidCurrentExpense(page, reason);
  } catch {
    // Best-effort cleanup: keep the original test failure as the useful signal.
  }
};

test.describe("expenses", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
  });

  test("creates, updates, and voids an expense", async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const expense = {
      name: `E2E Expense Test ${timestamp}`,
      amount: "1500",
      comments: `Comentario E2E gasto ${timestamp}`,
      tagsCount: 2,
    };
    const updatedName = `E2E Expense Test ${timestamp} Updated`;
    const updatedComment = `Comentario E2E gasto actualizado ${timestamp}`;
    const voidReason = `Anulacion E2E gasto ${timestamp}`;
    let expenseUrl: string | null = null;

    try {
      const createdExpense = await createExpense(page, expense);
      expenseUrl = createdExpense.url;

      await expectExpenseName(page, expense.name);
      await expect(page.getByPlaceholder("18000")).toHaveValue("1,500");
      await expect(page.getByText(createdExpense.selectedCategory)).toBeVisible();
      await expect(page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2")).toHaveValue(expense.comments);

      for (const tag of createdExpense.selectedTags) {
        await expect(page.getByText(tag)).toBeVisible();
      }

      await page.getByRole("button", { name: /^actualizar$/i }).click();
      await page.locator('input[name="name"]').fill(updatedName);
      await page.getByPlaceholder("18000").fill("2500");
      await page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2").fill(updatedComment);
      await page.locator("form").getByRole("button", { name: /actualizar/i }).click();

      await expectExpenseName(page, updatedName);
      await expect(page.getByPlaceholder("18000")).toHaveValue("2,500");
      await expect(page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2")).toHaveValue(updatedComment);

      await voidCurrentExpense(page, voidReason);
      expenseUrl = null;
    } finally {
      if (expenseUrl) {
        await voidExpenseIfPresent(page, expenseUrl, `Cleanup ${voidReason}`);
      }
    }
  });

  test("clones an expense", async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const originalExpense = {
      name: `E2E Expense Test ${timestamp}`,
      amount: "1500",
      comments: `Comentario E2E gasto ${timestamp}`,
      tagsCount: 2,
    };
    const cloneName = `E2E Expense Clone ${timestamp}`;
    const cloneComment = `Comentario E2E gasto clon ${timestamp}`;
    const originalVoidReason = `Anulacion E2E gasto original ${timestamp}`;
    const cloneVoidReason = `Anulacion E2E gasto clon ${timestamp}`;
    let originalExpenseUrl: string | null = null;
    let clonedExpenseUrl: string | null = null;

    try {
      const createdExpense = await createExpense(page, originalExpense);
      originalExpenseUrl = createdExpense.url;

      await expectExpenseName(page, originalExpense.name);
      await expect(page.getByPlaceholder("18000")).toHaveValue("1,500");
      await page.getByTestId("nav-action-clonar").click();
      await expect(page).toHaveURL(/\/gastos\/crear\?clonar=/, { timeout: 30_000 });

      await expect(page.locator('input[name="name"]')).toHaveValue(originalExpense.name);
      await expect(page.getByPlaceholder("18000")).toHaveValue("1,500");
      await expect(page.getByText(createdExpense.selectedCategory)).toBeVisible();
      await expect(page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2")).toHaveValue(originalExpense.comments);

      await page.locator('input[name="name"]').fill(cloneName);
      await page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2").fill(cloneComment);
      await page.locator("form").getByRole("button", { name: /crear/i }).click();
      await waitForEntityDetailUrl(page, "gastos");

      clonedExpenseUrl = page.url();
      expect(clonedExpenseUrl).not.toBe(originalExpenseUrl);
      await expectExpenseName(page, cloneName);
      await expect(page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2")).toHaveValue(cloneComment);

      await voidCurrentExpense(page, cloneVoidReason);
      clonedExpenseUrl = null;

      await voidExpenseIfPresent(page, originalExpenseUrl, originalVoidReason);
      originalExpenseUrl = null;
    } finally {
      if (clonedExpenseUrl) {
        await voidExpenseIfPresent(page, clonedExpenseUrl, `Cleanup ${cloneVoidReason}`);
      }

      if (originalExpenseUrl) {
        await voidExpenseIfPresent(page, originalExpenseUrl, `Cleanup ${originalVoidReason}`);
      }
    }
  });
});
