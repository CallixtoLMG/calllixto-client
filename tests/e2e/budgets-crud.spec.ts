import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import {
  addAddress,
  addPhone,
  dismissUnsavedChangesIfVisible,
  waitForEntityDetailAfterSubmit,
  waitForEntityDetailUrl,
} from "./support/entities";

type BudgetDependencies = {
  customer: { name: string; address: string };
  product: { name: string };
};

type BudgetFormOptions = {
  quantity?: string;
  productDiscount?: string;
  totalDiscount?: string;
  surcharge?: string;
};

const budgetsListUrl = /\/ventas(?:\?|$)/;
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

const replaceSearchOption = async (page: Page, testId: string, text: string) => {
  const field = page.getByTestId(testId);
  const input = field.locator("input");

  await input.press("Backspace");
  await input.fill(text);
  await expect(page.getByText(text).first()).toBeVisible({ timeout: 30_000 });
  await page.getByText(text).first().click();
};

const createCustomerForBudgetIfNeeded = async (page: Page, timestamp: number) => {
  const customer = {
    name: `E2E Budget Customer ${timestamp}`,
    address: "Calle E2E Ventas 123",
  };

  await page.goto("/clientes/crear");
  await expect(page).toHaveURL(/\/clientes\/crear(?:\?|$)/);

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
    name: `E2E Budget Supplier ${timestamp}`,
  };

  await page.goto("/proveedores/crear");
  await expect(page).toHaveURL(/\/proveedores\/crear(?:\?|$)/);

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
    name: `E2E Budget Brand ${timestamp}`,
  };

  await page.goto("/marcas/crear");
  await expect(page).toHaveURL(/\/marcas\/crear(?:\?|$)/);

  await page.locator('input[name="id"]').fill(brand.id);
  await page.locator('input[name="name"]').fill(brand.name);
  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailAfterSubmit(page, "marcas");

  return brand;
};

const createProductForBudgetIfNeeded = async (page: Page, timestamp: number) => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const attemptTimestamp = timestamp + attempt;
    const product = {
      localId: productLocalId(attemptTimestamp),
      name: `E2E Budget Product ${timestamp}`,
    };

    try {
      const supplier = await createSupplier(page, attemptTimestamp, attempt);
      const brand = await createBrand(page, attemptTimestamp, attempt);

      await page.goto("/productos/crear");
      await expect(page).toHaveURL(/\/productos\/crear(?:\?|$)/);

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
  const customer = await createCustomerForBudgetIfNeeded(page, timestamp);
  const product = await createProductForBudgetIfNeeded(page, timestamp);

  return { customer, product };
};

const addProductToBudget = async (
  page: Page,
  productName: string,
  { index = 0, quantity = "2", discount = "10" } = {},
) => {
  await selectSearchOption(page, "budget-product-search", productName);
  await expect(page.getByTestId(`budget-product-${index}-quantity-field`)).toBeVisible({ timeout: 30_000 });
  await fillTestIdInput(page, `budget-product-${index}-quantity-field`, quantity);
  await fillTestIdInput(page, `budget-product-${index}-discount-field`, discount);
};

const fillBudgetForm = async (
  page: Page,
  dependencies: BudgetDependencies,
  timestamp: number,
  {
    quantity = "2",
    productDiscount = "10",
    totalDiscount = "5",
    surcharge = "3",
  }: BudgetFormOptions = {},
) => {
  await page.getByRole("button", { name: /enviar a direcci/i }).click();
  await fillTestIdInput(page, "budget-expiration-days-field", "7");
  await selectSearchOption(page, "budget-customer-search", dependencies.customer.name);
  await expect(page.getByText(/Casa: Calle E2E Ventas 123/i)).toBeVisible();
  await expect(page.getByText(/Casa: \+54 385 5555555/i)).toBeVisible();

  await addProductToBudget(page, dependencies.product.name, { quantity, discount: productDiscount });
  await fillTestIdInput(page, "budget-global-discount-field", totalDiscount);
  await fillTestIdInput(page, "budget-additional-charge-field", surcharge);
  await page.getByTestId("textarea-comments").fill(`Comentario E2E presupuesto ${timestamp}`);
};

const openCreateBudgetPage = async (page: Page) => {
  await page.goto("/ventas");
  await expect(page).toHaveURL(budgetsListUrl);
  await expect(page.getByTestId("nav-action-crear")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("nav-action-crear").click();
  await expect(page).toHaveURL(/\/ventas\/crear(?:\?|$)/);
};

const createDraftBudget = async (page: Page, dependencies: BudgetDependencies, timestamp: number) => {
  await openCreateBudgetPage(page);
  await fillBudgetForm(page, dependencies, timestamp);
  await page.getByTestId("budget-submit-draft-button").click();
  await expect(page).toHaveURL(/\/ventas\/[^/]+\/borrador(?:\?|$)/, { timeout: 30_000 });
  await expect(page.getByText(/borrador/i).first()).toBeVisible({ timeout: 30_000 });

  return new URL(page.url()).pathname.split("/")[2];
};

const createConfirmedBudget = async (page: Page, dependencies: BudgetDependencies, timestamp: number) => {
  await openCreateBudgetPage(page);
  await page.getByTestId("budget-state-confirmed-button").click();
  await fillBudgetForm(page, dependencies, timestamp);
  await page.getByTestId("budget-submit-current-state-button").click();
  await expect(page).toHaveURL(/\/ventas\/[^/]+(?:\?|$)/, { timeout: 30_000 });
  await expect(page.getByText(/confirmado/i).first()).toBeVisible({ timeout: 30_000 });

  return new URL(page.url()).pathname.split("/")[2];
};

const moveBudgetToPending = async (page: Page) => {
  await page.getByTestId("budget-state-pending-button").click();
  await page.getByTestId("budget-submit-current-state-button").click();
  await expect(page).toHaveURL(/\/ventas\/[^/]+(?:\?|$)/, { timeout: 30_000 });
  await expect(page.getByText(/pendiente/i).first()).toBeVisible({ timeout: 30_000 });
};

const confirmBudget = async (page: Page) => {
  await page.getByRole("button", { name: /^confirmar$/i }).click();
  await expect(page.getByText(/desea confirmar/i)).toBeVisible({ timeout: 30_000 });
  await page.locator(".ui.modal").getByRole("button", { name: /^confirmar$/i }).click();
  await expect(page.getByText(/confirmado/i).first()).toBeVisible({ timeout: 30_000 });
};

const createPendingBudget = async (page: Page, dependencies: BudgetDependencies, timestamp: number) => {
  const budgetId = await createDraftBudget(page, dependencies, timestamp);
  await moveBudgetToPending(page);
  return budgetId;
};

const updateDraftBudget = async (
  page: Page,
  budgetId: string,
  updatedDependencies: BudgetDependencies,
  timestamp: number,
) => {
  await page.goto(`/ventas/${budgetId}/borrador`);
  await expect(page).toHaveURL(new RegExp(`/ventas/${budgetId}/borrador(?:\\?|$)`));

  await replaceSearchOption(page, "budget-customer-search", updatedDependencies.customer.name);
  await expect(page.getByText(/Casa: Calle E2E Ventas 123/i)).toBeVisible();
  await addProductToBudget(page, updatedDependencies.product.name, { index: 1, quantity: "3", discount: "15" });
  await fillTestIdInput(page, "budget-global-discount-field", "6");
  await fillTestIdInput(page, "budget-additional-charge-field", "4");
  await page.getByTestId("textarea-comments").fill(`Comentario E2E presupuesto actualizado ${timestamp}`);
  await page.getByTestId("budget-submit-draft-button").click();

  await expect(page).toHaveURL(new RegExp(`/ventas/${budgetId}/borrador(?:\\?|$)`), { timeout: 30_000 });
  await expect(page.getByText(/borrador/i).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("budget-customer-search").locator("input")).toHaveValue(updatedDependencies.customer.name);
  await expect(page.getByTestId("budget-product-1-quantity-field").locator("input")).toHaveValue("3");
  await expect(page.getByTestId("textarea-comments")).toHaveValue(`Comentario E2E presupuesto actualizado ${timestamp}`);
};

const selectFirstPaymentMethod = async (page: Page) => {
  await page.getByTestId("budget-payment-method-dropdown").click();
  const option = page
    .locator('[role="option"]')
    .filter({ hasNotText: /sin resultados|no hay|dolares/i })
    .first();

  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
};

const completeBudgetPayments = async (page: Page, timestamp: number) => {
  await page.getByTestId("budget-detail-tab-payments").click();
  await page.getByTestId("budget-add-payment-button").click();
  await expect(page.locator(".ui.modal").getByText(/^agregar pago$/i)).toBeVisible({ timeout: 30_000 });

  await selectFirstPaymentMethod(page);
  await page.getByTestId("budget-payment-complete-amount-button").click();
  await page.getByTestId("budget-payment-comments-field").fill(`Pago E2E presupuesto ${timestamp}`);
  await page.getByTestId("budget-payment-submit-button").click();

  await expect(page.getByText(`Pago E2E presupuesto ${timestamp}`)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("budget-add-payment-button")).toBeDisabled({ timeout: 30_000 });
};

const completeBudgetDeliveries = async (page: Page, timestamp: number) => {
  await page.getByTestId("budget-detail-tab-deliveries").click();
  await page.getByTestId("budget-open-delivery-modal-button").click();
  await expect(page.getByText(/registrar entrega/i)).toBeVisible({ timeout: 30_000 });

  await page.getByTestId("budget-delivery-note-field").locator("input").fill(`R-${timestamp}`);
  await page.getByTestId("budget-complete-all-deliveries-button").click();
  await page.getByTestId("modal-confirm").click();

  await expect(page.getByText(/entrega registrada correctamente/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("budget-open-delivery-modal-button")).toBeDisabled({ timeout: 30_000 });
};

test.describe("budgets", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
  });

  test("creates a draft budget, moves it to pending, and confirms it", async ({ page }) => {
    test.setTimeout(240_000);

    const timestamp = Date.now();
    const dependencies = await createBudgetDependencies(page, timestamp);

    const budgetId = await createDraftBudget(page, dependencies, timestamp);
    await expect(page).toHaveURL(new RegExp(`/ventas/${budgetId}/borrador(?:\\?|$)`));

    await moveBudgetToPending(page);
    await expect(page).toHaveURL(new RegExp(`/ventas/${budgetId}(?:\\?|$)`));

    await confirmBudget(page);
    await expect(page).toHaveURL(new RegExp(`/ventas/${budgetId}(?:\\?|$)`));
  });

  test("creates a draft budget, updates it, and saves it again as draft", async ({ page }) => {
    test.setTimeout(300_000);

    const timestamp = Date.now();
    const dependencies = await createBudgetDependencies(page, timestamp);
    const updatedDependencies = await createBudgetDependencies(page, timestamp + 1);

    const budgetId = await createDraftBudget(page, dependencies, timestamp);
    await updateDraftBudget(page, budgetId, updatedDependencies, timestamp);
  });

  test("confirms a budget and completes payments and deliveries", async ({ page }) => {
    test.setTimeout(300_000);

    const timestamp = Date.now();
    const dependencies = await createBudgetDependencies(page, timestamp);

    const budgetId = await createPendingBudget(page, dependencies, timestamp);
    await confirmBudget(page);
    await expect(page).toHaveURL(new RegExp(`/ventas/${budgetId}(?:\\?|$)`));

    await completeBudgetPayments(page, timestamp);
    await completeBudgetDeliveries(page, timestamp);
  });

  test("creates a confirmed budget and completes payments and deliveries", async ({ page }) => {
    test.setTimeout(300_000);

    const timestamp = Date.now();
    const dependencies = await createBudgetDependencies(page, timestamp);

    const budgetId = await createConfirmedBudget(page, dependencies, timestamp);
    await expect(page).toHaveURL(new RegExp(`/ventas/${budgetId}(?:\\?|$)`));

    await completeBudgetPayments(page, timestamp);
    await completeBudgetDeliveries(page, timestamp);
  });
});
