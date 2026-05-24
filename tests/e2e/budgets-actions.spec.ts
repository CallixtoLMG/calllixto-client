import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import {
  addAddress,
  addPhone,
  dismissUnsavedChangesIfVisible,
  waitForEntityDetailAfterSubmit,
  waitForEntityDetailUrl,
} from "./support/entities";

type CustomerFixture = {
  name: string;
  address: string;
};

type SupplierFixture = {
  id: string;
  name: string;
};

type BrandFixture = {
  id: string;
  name: string;
};

type ProductFixture = {
  localId: string;
  fullId: string;
  name: string;
  url: string;
};

type BudgetDependencies = {
  customer: CustomerFixture;
  product: ProductFixture;
};

const budgetsListUrl = /\/ventas(?:\?|$)/;
const confirmedBudgetUrl = /\/ventas\/(?!crear(?:\?|$))[^/]+(?:\?|$)/;
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

const createCustomerForBudgetIfNeeded = async (page: Page, timestamp: number): Promise<CustomerFixture> => {
  const customer = {
    name: `E2E Budget Customer ${timestamp}`,
    address: "Calle E2E Budget 123",
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

const createSupplierForBudget = async (page: Page, timestamp: number, attempt: number): Promise<SupplierFixture> => {
  const supplier = {
    id: twoDigitIdWithAttempt(timestamp, attempt),
    name: `E2E Budget Action Supplier ${timestamp} ${attempt}`,
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

const createBrandForBudget = async (page: Page, timestamp: number, attempt: number): Promise<BrandFixture> => {
  const brand = {
    id: twoDigitIdWithAttempt(timestamp + 37, attempt),
    name: `E2E Budget Action Brand ${timestamp} ${attempt}`,
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

const createProductForBudget = async (
  page: Page,
  timestamp: number,
  {
    name = `E2E Product Budget Action ${timestamp}`,
    cost = "1000",
    price = "1500",
  } = {},
): Promise<ProductFixture> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const attemptTimestamp = timestamp + attempt * 13;
    const localId = productLocalId(attemptTimestamp);

    try {
      const supplier = await createSupplierForBudget(page, attemptTimestamp, attempt);
      const brand = await createBrandForBudget(page, attemptTimestamp, attempt);

      await page.goto("/productos/crear");
      await expect(page).toHaveURL(/\/productos\/crear(?:\?|$)/);
      await selectSearchOption(page, "product-supplier-search", supplier.name);
      await selectSearchOption(page, "product-brand-search", brand.name);
      await fillTestIdInput(page, "product-id-field", localId);
      await page.locator('input[name="name"]').fill(name);
      await fillTestIdInput(page, "product-cost-field", cost);
      await fillTestIdInput(page, "product-price-field", price);
      await page.getByPlaceholder("Realmente son muchas pulgadas").fill(`Producto E2E para budget ${timestamp}`);
      await page.locator("form").getByRole("button", { name: /crear/i }).click();
      await dismissUnsavedChangesIfVisible(page);
      await waitForEntityDetailAfterSubmit(page, "productos");

      return {
        localId,
        name,
        url: page.url(),
        fullId: `${supplier.id}${brand.id}${localId}`,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

const createBudgetDependencies = async (page: Page, timestamp: number): Promise<BudgetDependencies> => {
  const customer = await createCustomerForBudgetIfNeeded(page, timestamp);
  const product = await createProductForBudget(page, timestamp);

  return { customer, product };
};

const openCreateBudgetPage = async (page: Page) => {
  await page.goto("/ventas");
  await expect(page).toHaveURL(budgetsListUrl);
  await page.goto("/ventas/crear");
  await expect(page).toHaveURL(/\/ventas\/crear(?:\?|$)/);
};

const addProductToBudget = async (
  page: Page,
  productName: string,
  { quantity = "2", discount = "10" } = {},
) => {
  await selectSearchOption(page, "budget-product-search", productName);
  await expect(page.getByTestId("budget-product-0-quantity-field")).toBeVisible({ timeout: 30_000 });
  await fillTestIdInput(page, "budget-product-0-quantity-field", quantity);
  await fillTestIdInput(page, "budget-product-0-discount-field", discount);
};

const fillBudgetForm = async (page: Page, dependencies: BudgetDependencies, timestamp: number) => {
  await page.getByRole("button", { name: /enviar a direcci/i }).click();
  await fillTestIdInput(page, "budget-expiration-days-field", "7");
  await selectSearchOption(page, "budget-customer-search", dependencies.customer.name);
  await expect(page.getByText(/Casa: Calle E2E Budget 123/i)).toBeVisible();
  await expect(page.getByText(/Casa: \+54 385 5555555/i)).toBeVisible();
  await addProductToBudget(page, dependencies.product.name);
  await fillTestIdInput(page, "budget-global-discount-field", "5");
  await fillTestIdInput(page, "budget-additional-charge-field", "3");
  await page.getByTestId("textarea-comments").fill(`Comentario E2E budget action ${timestamp}`);
};

const createConfirmedBudgetWithProduct = async (
  page: Page,
  dependencies: BudgetDependencies,
  timestamp: number,
) => {
  await openCreateBudgetPage(page);
  await page.getByTestId("budget-state-confirmed-button").click();
  await fillBudgetForm(page, dependencies, timestamp);
  await page.getByTestId("budget-submit-current-state-button").click();
  await expect(page).toHaveURL(confirmedBudgetUrl, { timeout: 30_000 });
  await expect(page.getByText(/confirmado/i).first()).toBeVisible({ timeout: 30_000 });

  return {
    id: new URL(page.url()).pathname.split("/")[2],
    url: page.url(),
  };
};

const openBudgetDetail = async (page: Page, budgetUrl: string, { reload = false } = {}) => {
  await page.goto(budgetUrl);
  if (reload) {
    await page.reload();
  }
  await expect(page).toHaveURL(confirmedBudgetUrl, { timeout: 30_000 });
  await expect(page.getByText(/confirmado/i).first()).toBeVisible({ timeout: 30_000 });
};

const voidCurrentBudget = async (page: Page, reason: string) => {
  await page.getByTestId("nav-action-anular venta").click();
  await expect(page.getByText(/desea anular el presupuesto/i)).toBeVisible({ timeout: 30_000 });
  await page.getByPlaceholder(/motivo/i).fill(reason);
  await page.getByTestId("modal-void").click({ force: true });

  await expect(page.getByText(/motivo de anulaci.n/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(reason)).toBeVisible();
  await expect(page.getByTestId("nav-action-anular venta")).toBeHidden();
};

const updateProductForCloneModal = async (page: Page, product: ProductFixture, timestamp: number) => {
  await page.goto(product.url);
  await waitForEntityDetailUrl(page, "productos");
  await expect(page.getByTestId("product-name-field")).toContainText(product.name, { timeout: 30_000 });
  await page.getByRole("button", { name: /^actualizar$/i }).first().click();
  await fillTestIdInput(page, "product-cost-field", "1200");
  await fillTestIdInput(page, "product-price-field", "1800");
  await page.getByPlaceholder("Realmente son muchas pulgadas").fill(`Producto actualizado para test de clonacion ${timestamp}`);
  const updateResponsePromise = page.waitForResponse((response) =>
    response.request().method() === "PUT" && response.url().includes(`/products/${product.fullId}`),
  );
  await page.locator("form").getByRole("button", { name: /^actualizar$/i }).click();
  await updateResponsePromise;
  await expect(page.getByRole("status").getByText(/producto actualizado/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("product-price-field").locator("input")).toHaveValue("1,800");
  await page.reload();
  await waitForEntityDetailUrl(page, "productos");
  await expect(page.getByTestId("product-price-field").locator("input")).toHaveValue("1,800", { timeout: 30_000 });
};

const cloneCurrentBudget = async (page: Page) => {
  await page.getByTestId("nav-action-clonar venta").click();
  await expect(page).toHaveURL(/\/ventas\/crear\?clonar=/, { timeout: 30_000 });
};

const assertProductChangesModalVisible = async (page: Page, product: ProductFixture) => {
  await expect(page.getByTestId("budget-product-updates-apply-current-button")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/productos con cambios/i)).toBeVisible();
  const productChange = page.locator("li").filter({ hasText: product.name }).first();
  await expect(productChange).toBeVisible();
  await expect(productChange).toContainText(/1[.,]500/i);
  await expect(productChange).toContainText(/1[.,]800/i);
};

const assertBudgetProductPrice = async (page: Page, expectedPrice: string) => {
  const priceField = page.getByTestId("budget-product-0-price-field");
  const priceLabel = page.getByTestId("budget-product-0-price-label");
  const priceControl = (await priceField.count()) > 0 ? priceField : priceLabel;

  await expect(priceControl).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(async () => {
      const input = priceControl.locator("input");
      const rawValue = (await input.count()) > 0 ? await input.inputValue() : await priceControl.innerText();
      return rawValue.replace(/[^\d]/g, "");
    }, { timeout: 30_000 })
    .toContain(expectedPrice);
};

const chooseKeepPreviousProductValues = async (page: Page) => {
  await page.getByTestId("budget-product-updates-keep-previous-button").click();
  await expect(page.getByTestId("budget-product-updates-apply-current-button")).toBeHidden({ timeout: 30_000 });
};

const chooseUpdateProductValues = async (page: Page) => {
  await page.getByTestId("budget-product-updates-apply-current-button").click();
  await expect(page.getByTestId("budget-product-updates-apply-current-button")).toBeHidden({ timeout: 30_000 });
};

const completeRequiredCloneFields = async (page: Page, dependencies: BudgetDependencies, timestamp: number) => {
  await page.getByTestId("budget-state-confirmed-button").click();
  await fillTestIdInput(page, "budget-expiration-days-field", "7");
  await selectSearchOption(page, "budget-customer-search", dependencies.customer.name);
  await page.getByTestId("textarea-comments").fill(`Comentario E2E budget clonado ${timestamp}`);
};

const confirmClonedBudget = async (page: Page) => {
  await page.getByTestId("budget-submit-current-state-button").click();
  await expect(page).toHaveURL(confirmedBudgetUrl, { timeout: 30_000 });
  await expect(page.getByText(/confirmado/i).first()).toBeVisible({ timeout: 30_000 });
};

test.describe("budget actions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
  });

  test("voids a confirmed budget", async ({ page }) => {
    test.setTimeout(180_000);

    const timestamp = Date.now();
    const dependencies = await createBudgetDependencies(page, timestamp);
    await createConfirmedBudgetWithProduct(page, dependencies, timestamp);

    await voidCurrentBudget(page, `Motivo E2E anulacion budget ${timestamp}`);
  });

  test("clones a confirmed budget and handles product changes modal", async ({ page }) => {
    test.setTimeout(240_000);

    const timestamp = Date.now();
    const customer = await createCustomerForBudgetIfNeeded(page, timestamp);
    const product = await createProductForBudget(page, timestamp, {
      name: `E2E Product Clone Budget ${timestamp}`,
      cost: "1000",
      price: "1500",
    });
    const dependencies = { customer, product };
    const budget = await createConfirmedBudgetWithProduct(page, dependencies, timestamp);

    await updateProductForCloneModal(page, product, timestamp);

    await openBudgetDetail(page, budget.url, { reload: true });
    await cloneCurrentBudget(page);
    await assertProductChangesModalVisible(page, product);
    await chooseKeepPreviousProductValues(page);
    await assertBudgetProductPrice(page, "1500");

    await openBudgetDetail(page, budget.url, { reload: true });
    await cloneCurrentBudget(page);
    await assertProductChangesModalVisible(page, product);
    await chooseUpdateProductValues(page);
    await assertBudgetProductPrice(page, "1800");
    await completeRequiredCloneFields(page, dependencies, timestamp);
    await confirmClonedBudget(page);
  });
});
