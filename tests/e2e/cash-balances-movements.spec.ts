import { expect, test, type Page } from "@playwright/test";
import { expectSuccessfulApiResponse, isApiResponse } from "./support/api";
import { loginAsE2EUser } from "./support/auth";
import { confirmOpenCashBalance } from "./support/cashBalances";
import { E2E_ACCOUNTS } from "./support/env";
import {
  addAddress,
  addPhone,
  dismissUnsavedChangesIfVisible,
  waitForCurrentRouteChunk,
  waitForEntityDetailAfterSubmit,
  waitForEntityDetailUrl,
} from "./support/entities";

type BudgetDependencies = {
  customer: { name: string; address: string };
  product: { name: string };
};

type PaymentFixture = {
  method?: string;
  amount: string;
  comments: string;
};

const twoDigitId = (seed: number) => (seed % 1296).toString(36).padStart(2, "0").toUpperCase();
const twoDigitIdWithAttempt = (seed: number, attempt: number) => twoDigitId(seed + attempt * 97);
const productLocalId = (seed: number) => (seed % 1_679_616).toString(36).padStart(4, "0").toUpperCase();

const fillTestIdInput = async (page: Page, testId: string, value: string) => {
  await page.getByTestId(testId).locator("input").fill(value);
};

const selectSearchOption = async (page: Page, testId: string, text: string) => {
  const field = page.getByTestId(testId);

  await field.locator("input").fill(text);
  await expect(page.getByText(text).first()).toBeVisible({ timeout: 30_000 });
  await page.getByText(text).first().click();
};

const openCashBalanceForMovements = async (page: Page, timestamp: number) => {
  const comment = `E2E Cash Balance Movements ${timestamp}`;

  await page.goto("/cajas");
  await expect(page).toHaveURL(/\/cajas(?:\?|$)/);
  await expect(page.getByTestId("nav-action-abrir")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("nav-action-abrir").click();
  await expect(page.getByTestId("open-cash-balance-modal")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("cash-balance-select-all-payment-methods").click();
  await expect(page.locator('input[value="Todos"]')).toBeVisible();
  await page.getByTestId("cash-balance-initial-amount-field").locator("input").fill("1000");
  await page.getByTestId("cash-balance-comments-field").fill(comment);
  const cashBalance = await confirmOpenCashBalance(page, comment);

  return { ...cashBalance, comment };
};

const closeCurrentCashBalance = async (page: Page) => {
  await page.getByTestId("nav-action-cerrar caja").click();
  await expect(page.getByText(/cerrar\s+la caja/i)).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("modal-confirm").click();
  await expect(page.getByText(/caja cerrada/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("nav-action-cerrar caja")).toBeHidden({ timeout: 30_000 });
};

const createCustomerForBudget = async (page: Page, timestamp: number) => {
  const customer = {
    name: `E2E Budget Cash Customer ${timestamp}`,
    address: "Calle E2E Caja 123",
  };

  await page.goto("/clientes/crear");
  await expect(page).toHaveURL(/\/clientes\/crear(?:\?|$)/);
  await waitForCurrentRouteChunk(page);
  await page.locator('input[name="name"]').fill(customer.name);
  await addPhone(page, { ref: "Casa", areaCode: "385", number: "5555555" });
  await addAddress(page, { ref: "Casa", address: customer.address });
  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailUrl(page, "clientes");

  return customer;
};

const createSupplier = async (page: Page, timestamp: number, attempt = 0) => {
  const supplier = {
    id: twoDigitIdWithAttempt(timestamp, attempt),
    name: `E2E Cash Movement Supplier ${timestamp}`,
  };

  await page.goto("/proveedores/crear");
  await expect(page).toHaveURL(/\/proveedores\/crear(?:\?|$)/);
  await waitForCurrentRouteChunk(page);
  await page.locator('input[name="id"]').fill(supplier.id);
  await page.locator('input[name="name"]').fill(supplier.name);
  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailAfterSubmit(page, "proveedores");

  return supplier;
};

const createBrand = async (page: Page, timestamp: number, attempt = 0) => {
  const brand = {
    id: twoDigitIdWithAttempt(timestamp + 37, attempt),
    name: `E2E Cash Movement Brand ${timestamp}`,
  };

  await page.goto("/marcas/crear");
  await expect(page).toHaveURL(/\/marcas\/crear(?:\?|$)/);
  await waitForCurrentRouteChunk(page);
  await page.locator('input[name="id"]').fill(brand.id);
  await page.locator('input[name="name"]').fill(brand.name);
  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailAfterSubmit(page, "marcas");

  return brand;
};

const createProductForBudget = async (page: Page, timestamp: number) => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const attemptTimestamp = timestamp + attempt;
    const product = {
      localId: productLocalId(attemptTimestamp),
      name: `E2E Budget Cash Product ${timestamp}`,
    };

    try {
      const supplier = await createSupplier(page, attemptTimestamp, attempt);
      const brand = await createBrand(page, attemptTimestamp, attempt);

      await page.goto("/productos/crear");
      await expect(page).toHaveURL(/\/productos\/crear(?:\?|$)/);
      await waitForCurrentRouteChunk(page);
      await selectSearchOption(page, "product-supplier-search", supplier.name);
      await selectSearchOption(page, "product-brand-search", brand.name);
      await fillTestIdInput(page, "product-id-field", product.localId);
      await page.locator('input[name="name"]').fill(product.name);
      await fillTestIdInput(page, "product-cost-field", "1000");
      await fillTestIdInput(page, "product-price-field", "1500");
      await page.locator("form").getByRole("button", { name: /crear/i }).click();
      await dismissUnsavedChangesIfVisible(page);
      await waitForEntityDetailAfterSubmit(page, "productos");

      return product;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

const createBudgetDependencies = async (page: Page, timestamp: number): Promise<BudgetDependencies> => {
  const customer = await createCustomerForBudget(page, timestamp);
  const product = await createProductForBudget(page, timestamp);

  return { customer, product };
};

const createConfirmedBudgetForCashMovement = async (
  page: Page,
  dependencies: BudgetDependencies,
  timestamp: number,
) => {
  await page.goto("/ventas/crear");
  await expect(page).toHaveURL(/\/ventas\/crear(?:\?|$)/);
  await waitForCurrentRouteChunk(page);
  await page.getByTestId("budget-state-confirmed-button").click();
  await page.getByRole("button", { name: /enviar a direcci/i }).click();
  await fillTestIdInput(page, "budget-expiration-days-field", "7");
  await selectSearchOption(page, "budget-customer-search", dependencies.customer.name);
  await selectSearchOption(page, "budget-product-search", dependencies.product.name);
  await expect(page.getByTestId("budget-product-0-quantity-field")).toBeVisible({ timeout: 30_000 });
  await fillTestIdInput(page, "budget-product-0-quantity-field", "2");
  await page.getByTestId("textarea-comments").fill(`E2E Budget Cash Movement ${timestamp}`);
  await page.getByTestId("budget-submit-current-state-button").click();
  await expect(page).toHaveURL(/\/ventas\/(?!crear(?:\?|$))[^/]+(?:\?|$)/, { timeout: 30_000 });
  await expect(page.getByText(/confirmado/i).first()).toBeVisible({ timeout: 30_000 });

  return { url: page.url(), id: new URL(page.url()).pathname.split("/")[2] };
};

const selectPaymentMethod = async (page: Page, method?: string) => {
  const dropdown = page.getByTestId("budget-payment-method-dropdown");
  await dropdown.click();

  const option = method
    ? page.getByRole("option", { name: method })
    : page
      .locator('[role="option"]')
      .filter({ visible: true })
      .filter({ hasNotText: /todos|no hay|no se encontraron|dolares/i })
      .first();

  await expect(option).toBeVisible({ timeout: 30_000 });
  const selectedMethod = (await option.innerText()).trim();
  await option.click();

  return selectedMethod;
};

const addPayment = async (page: Page, payment: PaymentFixture) => {
  await page.getByTestId("budget-add-payment-button").click();
  await expect(page.locator(".header").filter({ hasText: /agregar pago/i })).toBeVisible({ timeout: 30_000 });
  const method = await selectPaymentMethod(page, payment.method);
  await page.getByTestId("budget-payment-amount-field").locator("input").fill(payment.amount);
  await page.getByTestId("budget-payment-comments-field").fill(payment.comments);
  await page.getByTestId("budget-payment-submit-button").click();
  await expect(page.getByTestId("table-row").filter({ hasText: payment.comments })).toBeVisible({ timeout: 30_000 });

  return { ...payment, method };
};

const payBudgetWithMethod = async (page: Page, payment: PaymentFixture) => {
  await page.getByTestId("budget-detail-tab-payments").click();
  await expect(page.getByText(/detalle de pagos/i)).toBeVisible({ timeout: 30_000 });
  return addPayment(page, payment);
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const waitForExpenseOptionalFieldsReady = async (page: Page) => {
  const categoriesDropdown = page.getByTestId("dropdown-categories");
  const tagsDropdown = page.getByTestId("dropdown-tags");

  await expect(categoriesDropdown).toBeVisible({ timeout: 30_000 });
  await expect(tagsDropdown).toBeVisible({ timeout: 30_000 });
  await expect(categoriesDropdown).not.toHaveAttribute("aria-busy", "true", { timeout: 30_000 });
  await expect(tagsDropdown).not.toHaveAttribute("aria-busy", "true", { timeout: 30_000 });
};

const selectExpenseCategoryIfProvided = async (page: Page, categoryName?: string) => {
  if (!categoryName) return null;

  const categoriesDropdown = page.getByTestId("dropdown-categories");
  await expect(categoriesDropdown).toBeVisible({ timeout: 30_000 });
  await expect(categoriesDropdown).not.toHaveAttribute("aria-busy", "true", { timeout: 30_000 });
  await categoriesDropdown.click();

  const option = page.getByRole("option", { name: new RegExp(`^${escapeRegExp(categoryName)}$`, "i") });

  await expect(option).toBeVisible({ timeout: 30_000 });
  await option.click();
  await expect(categoriesDropdown.locator(".label").filter({ hasText: categoryName })).toBeVisible({ timeout: 30_000 });

  return categoryName;
};

const createExpenseForCashMovement = async (page: Page, timestamp: number, categoryName?: string) => {
  const expense = {
    name: `E2E Expense Cash Movement ${timestamp}`,
    amount: "200",
    comments: `Comentario E2E expense cash movement ${timestamp}`,
  };

  await page.goto("/gastos/crear");
  await expect(page).toHaveURL(/\/gastos\/crear(?:\?|$)/);
  await waitForCurrentRouteChunk(page);
  await waitForExpenseOptionalFieldsReady(page);
  await page.locator('input[name="name"]').fill(expense.name);
  await page.getByPlaceholder("18000").fill(expense.amount);
  await selectExpenseCategoryIfProvided(page, categoryName);
  await page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2").fill(expense.comments);

  const responsePromise = page.waitForResponse((response) =>
    isApiResponse(response, "POST", "expenses"),
  );

  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  const response = await responsePromise;
  const body = await expectSuccessfulApiResponse(response, { responseEntity: "expense" });
  const expenseId = body.expense.id;

  await waitForEntityDetailUrl(page, "gastos");
  await expect(page).toHaveURL(new RegExp(`/gastos/${expenseId}(?:\\?|$)`));

  return { ...expense, url: page.url(), id: expenseId };
};

const payExpenseWithMethod = async (page: Page, expenseUrl: string, payment: PaymentFixture) => {
  await page.goto(expenseUrl);
  await waitForEntityDetailUrl(page, "gastos");
  const paymentsTab = page.locator(".ui.tabular.menu .item").filter({ hasText: /^Pagos$/ });
  await expect(paymentsTab).toBeVisible({ timeout: 30_000 });
  await paymentsTab.click();
  await expect(page.getByText(/detalle de pagos/i)).toBeVisible({ timeout: 30_000 });
  return addPayment(page, payment);
};

const openCashBalanceMovements = async (page: Page, cashBalanceUrl: string) => {
  await page.goto(cashBalanceUrl);
  await expect(page).toHaveURL(/\/cajas\/[^/?]+$/, { timeout: 30_000 });
  await page.locator(".ui.menu .item").filter({ hasText: /^Movimientos$/ }).click();
  await expect(page.getByText(/movimientos de caja/i)).toBeVisible({ timeout: 30_000 });
};

const normalizeMoney = (value: string) => value.replace(/[^\d]/g, "");

const assertCashBalanceMovementVisible = async (
  page: Page,
  payment: PaymentFixture & { method?: string },
  kind: "Venta" | "Gasto",
  entityId: string,
) => {
  const row = page.getByTestId("table-row").filter({ hasText: payment.comments });

  await expect(row).toBeVisible({ timeout: 30_000 });
  await expect(row).toContainText(`${kind} - ${entityId}`);
  await expect(row).toContainText(payment.method ?? "");
  await expect
    .poll(async () => normalizeMoney(await row.innerText()), { timeout: 30_000 })
    .toContain(payment.amount);
};

const voidExpenseIfPossible = async (page: Page, expenseUrl: string | null, reason: string) => {
  if (!expenseUrl) return;

  try {
    await page.goto(expenseUrl);
    const voidButton = page.getByTestId("nav-action-anular");
    if (!(await voidButton.isVisible({ timeout: 5_000 }).catch(() => false))) return;
    await voidButton.click();
    await page.getByPlaceholder(/motivo/i).fill(reason);
    const confirmButton = page.getByTestId("modal-void");
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();
    await expect(page.getByText(reason)).toBeVisible({ timeout: 30_000 });
  } catch {
    // Best-effort cleanup: keep the original test failure as the useful signal.
  }
};

test.describe("cash balance movements", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, { accountName: E2E_ACCOUNTS.modulesEnabled });
  });

  test(
    "records budget and expense movements in a cash balance",
    { tag: ["@modules-enabled", "@cash-balances"] },
    async ({ page }) => {
    test.setTimeout(300_000);

    const timestamp = Date.now();
    let cashBalanceUrl: string | null = null;
    let expenseUrl: string | null = null;

    try {
      const cashBalance = await openCashBalanceForMovements(page, timestamp);
      cashBalanceUrl = cashBalance.url;

      const dependencies = await createBudgetDependencies(page, timestamp);
      const budget = await createConfirmedBudgetForCashMovement(page, dependencies, timestamp);
      const budgetPayment = await payBudgetWithMethod(page, {
        amount: "500",
        comments: `E2E budget cash payment ${timestamp}`,
      });

      const expense = await createExpenseForCashMovement(page, timestamp);
      expenseUrl = expense.url;
      const expensePayment = await payExpenseWithMethod(page, expense.url, {
        method: budgetPayment.method,
        amount: "200",
        comments: `E2E expense cash payment ${timestamp}`,
      });

      await openCashBalanceMovements(page, cashBalance.url);
      await assertCashBalanceMovementVisible(page, budgetPayment, "Venta", budget.id);
      await assertCashBalanceMovementVisible(page, expensePayment, "Gasto", expense.id);

      await closeCurrentCashBalance(page);
    } finally {
      if (cashBalanceUrl) {
        try {
          await page.goto(cashBalanceUrl);
          if (await page.getByTestId("nav-action-cerrar caja").isVisible({ timeout: 5_000 }).catch(() => false)) {
            await closeCurrentCashBalance(page);
          }
        } catch {
          // Best-effort cleanup: the movement assertions remain the relevant failure signal.
        }
      }

      await voidExpenseIfPossible(page, expenseUrl, `Cleanup E2E cash movement ${timestamp}`);
    }
    },
  );
});
