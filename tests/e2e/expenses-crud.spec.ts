import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectSuccessfulApiResponse, isApiResponse } from "./support/api";
import { loginAsE2EUser } from "./support/auth";
import { E2E_ACCOUNTS } from "./support/env";
import { waitForEntityDetailUrl, waitForExpenseSettingsReady } from "./support/entities";

const listUrl = /\/gastos(?:\?|$)/;

type ExpenseFixture = {
  name: string;
  amount: string;
  comments: string;
  categoryName?: string;
  tagsCount?: number;
};

const openExpensesList = async (page: Page) => {
  await page.goto("/gastos");
  await expect(page).toHaveURL(listUrl);
  await expect(page.getByTestId("nav-action-crear")).toBeVisible();
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fillTestIdInput = async (page: Page, testId: string, value: string) => {
  await page.getByTestId(testId).locator("input").fill(value);
};

const typeIntoField = async (page: Page, selector: string, value: string) => {
  const field = page.locator(selector);
  await field.click();
  await field.press("ControlOrMeta+A");
  await field.pressSequentially(value);
};

const typeIntoPlaceholder = async (page: Page, placeholder: string | RegExp, value: string) => {
  const field = page.getByPlaceholder(placeholder);
  await field.click();
  await field.press("ControlOrMeta+A");
  await field.pressSequentially(value);
};

const openSettingsAccordion = async (page: Page, accordionTestId: string, fieldTestId: string) => {
  const field = page.getByTestId(fieldTestId).locator("input");

  if (await field.isVisible({ timeout: 500 })) return;

  await page.getByTestId(accordionTestId).click();
  await expect(field).toBeVisible();
};

const ensureExpenseCategoryAvailable = async (page: Page, categoryName: string) => {
  await page.goto("/configuracion?tab=gastos");
  await expect(page).toHaveURL(/\/configuracion\?tab=gastos$/);
  await openSettingsAccordion(page, "settings-categories-accordion", "settings-category-name-field");
  await fillTestIdInput(page, "settings-category-name-field", categoryName);
  await fillTestIdInput(page, "settings-category-description-field", `Categoria E2E gasto ${categoryName}`);
  await page.getByTestId("settings-category-description-field").locator("input").press("Enter");
  await expect(page.getByText(categoryName, { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("settings-update-button").click();
  await expect(page.getByText(/cambios guardados correctamente/i)).toBeVisible({ timeout: 30_000 });

  return categoryName;
};

const selectAvailableCategory = async (page: Page, categoryName?: string) => {
  const categoriesDropdown = page.getByTestId("dropdown-categories");
  await expect(categoriesDropdown).toBeVisible();
  await categoriesDropdown.click();

  if (categoryName) {
    const categoryOption = page.getByRole("option", { name: new RegExp(escapeRegExp(categoryName), "i") });
    await expect(categoryOption).toBeVisible({ timeout: 30_000 });
    await categoryOption.click();
    await expect(categoriesDropdown.locator(".label").filter({ hasText: categoryName })).toBeVisible({ timeout: 30_000 });

    return categoryName;
  }

  const options = page
    .locator('[role="option"]')
    .filter({ visible: true })
    .filter({ hasNotText: /todos|no hay|no se encontraron/i });

  if (!(await options.count())) {
    await page.keyboard.press("Escape");
    return null;
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
  await typeIntoField(page, 'input[name="name"]', expense.name);
  await typeIntoPlaceholder(page, "18000", expense.amount);

  // The datepicker is intentionally left with its default date. Changing it through
  // react-datepicker would add fragile selector coupling without improving this smoke flow.
  const selectedCategory = expense.categoryName
    ? await selectAvailableCategory(page, expense.categoryName)
    : null;

  const selectedTags = expense.tagsCount
    ? await selectAvailableTags(page, expense.tagsCount)
    : [];

  await typeIntoPlaceholder(page, "Quiero ver el Juego del Calamar temporada 2", expense.comments);

  return {
    selectedCategory,
    selectedTags,
  };
};

const createExpense = async (page: Page, expense: ExpenseFixture) => {
  await page.goto("/gastos/crear");
  await expect(page).toHaveURL(/\/gastos\/crear(?:\?|$)/);
  await waitForExpenseSettingsReady(page);

  const selectedData = await fillExpenseForm(page, expense);
  const createResponsePromise = page.waitForResponse((response) => isApiResponse(response, "POST", "expenses"));

  const createButton = page.locator("form").getByRole("button", { name: /crear/i });
  await expect(createButton).toBeEnabled();
  await createButton.click();
  const createBody = await expectSuccessfulApiResponse(await createResponsePromise, { responseEntity: "expense" });
  await expect(page).toHaveURL(new RegExp(`/gastos/${createBody.expense.id}(?:\\?|$)`), { timeout: 30_000 });

  return {
    url: page.url(),
    id: createBody.expense.id,
    ...selectedData,
  };
};

const expectExpenseName = async (page: Page, name: string) => {
  await expect(page.getByTestId("expense-name-field")).toContainText(name, { timeout: 30_000 });
};

const getPageActionsRail = (page: Page) => page.getByTestId("page-actions-aside");

const expectActionReady = async (action: Locator) => {
  await expect(action).toBeVisible();
  await expect(action).toBeEnabled();
  await action.click({ trial: true });
};

const expandPageActionsRail = async (page: Page) => {
  const rail = getPageActionsRail(page);
  await expect(rail).toBeAttached();

  const railToggle = rail.getByTestId("page-actions-rail-toggle");

  if (await railToggle.getAttribute("aria-expanded") === "false") {
    await railToggle.click();
    await expect(railToggle).toHaveAttribute("aria-expanded", "true");
  }

  return rail;
};

const getExpenseDetailAction = async (page: Page, actionTestId: string) => {
  const rail = await expandPageActionsRail(page);
  const action = rail.getByTestId(actionTestId);
  await expectActionReady(action);
  return action;
};

const voidCurrentExpense = async (page: Page, reason: string) => {
  const expenseId = new URL(page.url()).pathname.split("/").pop();
  const voidAction = await getExpenseDetailAction(page, "nav-action-anular gasto");
  await voidAction.click();
  await page.getByPlaceholder(/motivo/i).fill(reason);
  const confirmButton = page.getByTestId("modal-void");
  await expect(confirmButton).toBeEnabled();
  const voidResponsePromise = page.waitForResponse((response) =>
    isApiResponse(response, "PUT", `expenses/${expenseId}/cancel`));
  await confirmButton.click();
  await expectSuccessfulApiResponse(await voidResponsePromise, { responseEntity: "expense", expectedId: expenseId });
  await expect(page.getByText(reason)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("nav-action-anular gasto")).toBeHidden();
};

const voidExpenseIfPresent = async (page: Page, expenseUrl: string, reason: string) => {
  try {
    await page.goto(expenseUrl);

    const rail = await expandPageActionsRail(page);
    const voidButton = rail.getByTestId("nav-action-anular gasto");
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
    await loginAsE2EUser(page, { accountName: E2E_ACCOUNTS.modulesEnabled });
  });

  test("creates, updates, and voids an expense", async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const expense = {
      name: `E2E Expense Test ${timestamp}`,
      amount: "1500",
      comments: `Comentario E2E gasto ${timestamp}`,
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
      if (createdExpense.selectedCategory) {
        await expect(page.getByText(createdExpense.selectedCategory)).toBeVisible();
      }
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
      categoryName: await ensureExpenseCategoryAvailable(page, `E2E Gasto Category Clone ${timestamp}`),
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
      const cloneAction = await getExpenseDetailAction(page, "nav-action-clonar gasto");
      await cloneAction.click();
      await expect(page).toHaveURL(/\/gastos\/crear\?clonar=/, { timeout: 30_000 });

      await expect(page.locator('input[name="name"]')).toHaveValue(originalExpense.name);
      await expect(page.getByPlaceholder("18000")).toHaveValue("1,500");
      if (createdExpense.selectedCategory) {
        await expect(page.getByText(createdExpense.selectedCategory)).toBeVisible();
      }
      await expect(page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2")).toHaveValue(originalExpense.comments);

      await page.locator('input[name="name"]').fill(cloneName);
      await page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2").fill(cloneComment);
      const cloneResponsePromise = page.waitForResponse((response) => isApiResponse(response, "POST", "expenses"));

      await page.locator("form").getByRole("button", { name: /crear/i }).click();
      const cloneBody = await expectSuccessfulApiResponse(await cloneResponsePromise, { responseEntity: "expense" });
      await waitForEntityDetailUrl(page, "gastos");

      clonedExpenseUrl = page.url();
      await expect(page).toHaveURL(new RegExp(`/gastos/${cloneBody.expense.id}(?:\\?|$)`));
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
