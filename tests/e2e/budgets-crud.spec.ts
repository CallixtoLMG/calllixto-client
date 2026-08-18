import { expect, test, type Locator, type Page, type Request, type Route } from "@playwright/test";
import { apiPathEndsWith, expectSuccessfulApiResponse, getApiResponseBody, isApiResponse } from "./support/api";
import { loginAsE2EUser } from "./support/auth";
import { E2E_ACCOUNTS } from "./support/env";
import {
  addAddress,
  addPhone,
  dismissUnsavedChangesIfVisible,
  waitForCurrentRouteChunk,
  waitForEntityDetailUrl,
} from "./support/entities";

type BudgetDependencies = {
  customer: { name: string; address: string };
  product: { localId: string; name: string };
};

type BudgetFormOptions = {
  quantity?: string;
  productDiscount?: string;
  totalDiscount?: string;
  surcharge?: string;
};

type BudgetDependencyOptions = {
  stockControl?: boolean;
};

const responseEntityByApiPath: Record<string, string> = {
  customers: "customer",
  suppliers: "supplier",
  brands: "brand",
  products: "product",
};

const budgetsListUrl = /\/ventas(?:\?|$)/;
const twoDigitId = (seed: number) => (seed % 1296).toString(36).padStart(2, "0").toUpperCase();
const twoDigitIdWithAttempt = (seed: number, attempt: number) => twoDigitId(seed + attempt * 97);
const productLocalId = (seed: number) => (seed % 1_679_616).toString(36).padStart(4, "0").toUpperCase();

const fillTestIdInput = async (page: Page, testId: string, value: string, expectedValue = value) => {
  await page.getByTestId(testId).locator("input").fill(value);
  await expect(page.getByTestId(testId).locator("input")).toHaveValue(expectedValue);
};

const submitCreateForm = async (page: Page, apiPath: string, entityPath: string) => {
  const submitButton = page.locator("form").getByRole("button", { name: /crear/i });
  await expect(submitButton).toBeEnabled({ timeout: 30_000 });

  const responsePromise = page.waitForResponse((response) => isApiResponse(response, "POST", apiPath));

  await Promise.all([
    responsePromise,
    submitButton.click(),
  ]);

  const response = await responsePromise;
  await expectSuccessfulApiResponse(response, { responseEntity: responseEntityByApiPath[apiPath] });

  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailUrl(page, entityPath);
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
  await waitForCurrentRouteChunk(page);

  await page.locator('input[name="name"]').fill(customer.name);
  await expect(page.locator('input[name="name"]')).toHaveValue(customer.name);
  await addPhone(page, { ref: "Casa", areaCode: "385", number: "5555555" });
  await addAddress(page, { ref: "Casa", address: customer.address });
  await submitCreateForm(page, "customers", "clientes");

  return customer;
};

const createSupplier = async (page: Page, timestamp: number, attempt = 0) => {
  const supplier = {
    id: twoDigitIdWithAttempt(timestamp, attempt),
    name: `E2E Budget Supplier ${timestamp}`,
    comment: `Comentario E2E budget supplier ${timestamp} ${attempt}`,
  };

  await page.goto("/proveedores/crear");
  await expect(page).toHaveURL(/\/proveedores\/crear(?:\?|$)/);
  await waitForCurrentRouteChunk(page);

  await page.locator('input[name="id"]').fill(supplier.id);
  await expect(page.locator('input[name="id"]')).toHaveValue(supplier.id);
  await page.locator('input[name="name"]').fill(supplier.name);
  await expect(page.locator('input[name="name"]')).toHaveValue(supplier.name);
  await page.getByPlaceholder("Siempre demora en los pedidos").fill(supplier.comment);
  await expect(page.getByPlaceholder("Siempre demora en los pedidos")).toHaveValue(supplier.comment);
  await submitCreateForm(page, "suppliers", "proveedores");

  return supplier;
};

const createBrand = async (page: Page, timestamp: number, attempt = 0) => {
  const brand = {
    id: twoDigitIdWithAttempt(timestamp + 37, attempt),
    name: `E2E Budget Brand ${timestamp}`,
    comment: `Comentario E2E budget brand ${timestamp} ${attempt}`,
  };

  await page.goto("/marcas/crear");
  await expect(page).toHaveURL(/\/marcas\/crear(?:\?|$)/);
  await waitForCurrentRouteChunk(page);

  await page.locator('input[name="id"]').fill(brand.id);
  await expect(page.locator('input[name="id"]')).toHaveValue(brand.id);
  await page.locator('input[name="name"]').fill(brand.name);
  await expect(page.locator('input[name="name"]')).toHaveValue(brand.name);
  await page.getByPlaceholder("Una marca macanuda").fill(brand.comment);
  await expect(page.getByPlaceholder("Una marca macanuda")).toHaveValue(brand.comment);
  await submitCreateForm(page, "brands", "marcas");

  return brand;
};

const createProductForBudgetIfNeeded = async (
  page: Page,
  timestamp: number,
  { stockControl = false }: BudgetDependencyOptions = {},
) => {
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
      await waitForCurrentRouteChunk(page);

      await selectSearchOption(page, "product-supplier-search", supplier.name);
      await selectSearchOption(page, "product-brand-search", brand.name);
      await fillTestIdInput(page, "product-id-field", product.localId);
      await page.locator('input[name="name"]').fill(product.name);
      await expect(page.locator('input[name="name"]')).toHaveValue(product.name);
      await fillTestIdInput(page, "product-cost-field", "1000", "1,000");
      await fillTestIdInput(page, "product-price-field", "1500", "1,500");
      if (stockControl) {
        await page.getByTestId("product-stock-control-toggle").click();
      }
      await page.getByPlaceholder("Realmente son muchas pulgadas").fill(`Producto E2E para presupuesto ${timestamp}`);
      await expect(page.getByPlaceholder("Realmente son muchas pulgadas")).toHaveValue(`Producto E2E para presupuesto ${timestamp}`);
      await submitCreateForm(page, "products", "productos");

      return product;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

const createBudgetDependencies = async (
  page: Page,
  timestamp: number,
  options: BudgetDependencyOptions = {},
): Promise<BudgetDependencies> => {
  const customer = await createCustomerForBudgetIfNeeded(page, timestamp);
  const product = await createProductForBudgetIfNeeded(page, timestamp, options);

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

const getPageActionsRail = (page: Page) => page.getByTestId("page-actions-aside");
const expectActionReady = async (action: Locator) => {
  await expect(action).toBeVisible();
  await expect(action).toBeEnabled();
  await action.click({ trial: true });
};

const openCreateBudgetPage = async (page: Page) => {
  await page.goto("/ventas");
  await expect(page).toHaveURL(budgetsListUrl);
  await expect(page.getByTestId("table-row")).not.toHaveCount(0, { timeout: 30_000 });
  const rail = getPageActionsRail(page);
  await expect(rail).toBeAttached();

  const railToggle = rail.getByTestId("page-actions-rail-toggle");

  if (await railToggle.getAttribute("aria-expanded") === "false") {
    await railToggle.click();
    await expect(railToggle).toHaveAttribute("aria-expanded", "true");
  }

  const createAction = rail.getByTestId("nav-action-crear venta");
  await expectActionReady(createAction);
  await createAction.click();
  await expect(page).toHaveURL(/\/ventas\/crear(?:\?|$)/);
  await waitForCurrentRouteChunk(page);
  await expect(page.getByTestId("budget-customer-search")).toBeVisible({ timeout: 30_000 });
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

const collectConsumeRequests = async (page: Page, budgetId: string) => {
  const requests: Request[] = [];

  await page.route("**/stock-flows/**/consume", async (route) => {
    const request = route.request();

    if (request.method() === "POST" && apiPathEndsWith(request.url(), `stock-flows/${budgetId}/consume`)) {
      requests.push(request);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ statusOk: true }),
      });
      return;
    }

    await route.continue();
  });

  return requests;
};

const collectBudgetProductPayloads = async (page: Page) => {
  const payloads: Array<{ products?: Record<string, unknown>[] }> = [];

  const collectPayload = async (route: Route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname.replace(/\/+$/g, "");
    const isBudgetSave =
      ["POST", "PUT"].includes(request.method()) &&
      /\/budgets(?:\/[^/]+)?$/.test(pathname);

    if (isBudgetSave) {
      const body = request.postDataJSON();

      if (Array.isArray(body?.products)) {
        payloads.push(body);
      }
    }

    await route.continue();
  };

  await page.route("**/budgets", collectPayload);
  await page.route("**/budgets/**", collectPayload);

  return payloads;
};

const openConfirmBudgetModal = async (page: Page) => {
  await page.getByRole("button", { name: /^confirmar$/i }).click();
  await expect(page.getByText(/desea confirmar/i)).toBeVisible({ timeout: 30_000 });
};

const confirmBudget = async (page: Page, budgetId: string) => {
  await openConfirmBudgetModal(page);

  const responsePromise = page.waitForResponse((response) =>
    isApiResponse(response, "PUT", `budgets/${budgetId}/confirm`)
  );

  await Promise.all([
    responsePromise,
    page.locator(".ui.modal").getByTestId("modal-confirm").click(),
  ]);

  const response = await responsePromise;
  await expectSuccessfulApiResponse(response, { responseEntity: "budget", expectedId: budgetId });
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
  const paymentComment = `Pago E2E presupuesto ${timestamp}`;

  await page.getByTestId("budget-detail-tab-payments").click();
  await page.getByTestId("budget-add-payment-button").click();
  await expect(page.locator(".ui.modal").getByText(/^agregar pago$/i)).toBeVisible({ timeout: 30_000 });

  await selectFirstPaymentMethod(page);
  await page.getByTestId("budget-payment-complete-amount-button").click();
  await page.getByTestId("budget-payment-comments-field").fill(paymentComment);
  await page.getByTestId("budget-payment-submit-button").click();

  const paymentsTable = page
    .getByRole("table")
    .filter({ has: page.getByRole("columnheader", { name: "Fecha de Pago" }) })
    .filter({ has: page.getByRole("columnheader", { name: "Comentarios" }) });
  const paymentRow = paymentsTable.getByRole("row").filter({ hasText: paymentComment });

  await expect(paymentRow).toHaveCount(1, { timeout: 30_000 });
  await expect(paymentRow.getByRole("cell", { name: paymentComment })).toBeVisible();
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
    await loginAsE2EUser(page, { accountName: E2E_ACCOUNTS.modulesEnabled });
  });

  test("creates a draft budget, moves it to pending, and confirms it", async ({ page }) => {
    test.setTimeout(240_000);

    const timestamp = Date.now();
    const dependencies = await createBudgetDependencies(page, timestamp);
    const budgetProductPayloads = await collectBudgetProductPayloads(page);

    const budgetId = await createDraftBudget(page, dependencies, timestamp);
    await expect(page).toHaveURL(new RegExp(`/ventas/${budgetId}/borrador(?:\\?|$)`));

    await moveBudgetToPending(page);
    await expect(page).toHaveURL(new RegExp(`/ventas/${budgetId}(?:\\?|$)`));

    const consumeRequests = await collectConsumeRequests(page, budgetId);
    await confirmBudget(page, budgetId);
    expect(consumeRequests).toHaveLength(0);
    expect(budgetProductPayloads.length).toBeGreaterThan(0);
    budgetProductPayloads.forEach((payload) => {
      payload.products?.forEach((product) => {
        expect(product).not.toHaveProperty("stockControl");
      });
    });
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
    await confirmBudget(page, budgetId);
    await expect(page).toHaveURL(new RegExp(`/ventas/${budgetId}(?:\\?|$)`));

    await completeBudgetPayments(page, timestamp);
    await completeBudgetDeliveries(page, timestamp);
  });

  test("confirms a pending budget with a partial delivery", async ({ page }) => {
    test.setTimeout(300_000);

    const timestamp = Date.now();
    const dependencies = await createBudgetDependencies(page, timestamp, { stockControl: true });

    const budgetId = await createPendingBudget(page, dependencies, timestamp);
    const consumeRequests = await collectConsumeRequests(page, budgetId);

    await openConfirmBudgetModal(page);
    await page.locator(".ui.modal").getByText("Entrega").click();
    await page.getByTestId("budget-confirm-delivery-note-field").locator("input").fill(`R-${timestamp}`);
    await fillTestIdInput(page, "budget-confirm-delivery-product-0-quantity-field", "1");
    await page.getByTestId("budget-confirm-delivery-product-0-comment-field").locator("input").fill("Entrega parcial E2E");

    const confirmResponsePromise = page.waitForResponse((response) =>
      isApiResponse(response, "PUT", `budgets/${budgetId}/confirm`)
    );
    const consumeResponsePromise = page.waitForResponse((response) =>
      isApiResponse(response, "POST", `stock-flows/${budgetId}/consume`)
    );

    await page.locator(".ui.modal").getByTestId("modal-confirm").click();

    const confirmResponse = await confirmResponsePromise;
    const consumeResponse = await consumeResponsePromise;

    await expectSuccessfulApiResponse(confirmResponse, { responseEntity: "budget", expectedId: budgetId });
    await expectSuccessfulApiResponse(consumeResponse);
    await expect(page.getByText(/confirmado/i).first()).toBeVisible({ timeout: 30_000 });

    expect(consumeRequests).toHaveLength(1);
    const consumeBody = consumeRequests[0].postDataJSON();

    expect(consumeBody).toEqual({
      deliveryNote: `R-${timestamp}`,
      inflow: false,
      flows: [
        expect.objectContaining({
          productId: expect.stringContaining(dependencies.product.localId),
          rowId: expect.any(String),
          quantity: 1,
          comments: "Entrega parcial E2E",
        }),
      ],
    });
    expect(consumeBody.flows[0].date).toEqual(expect.any(String));
    expect(consumeBody.flows[0]).not.toHaveProperty("stockControl");
  });

  test("does not consume stock when pending budget confirmation fails", async ({ page }) => {
    test.setTimeout(300_000);

    const timestamp = Date.now();
    const dependencies = await createBudgetDependencies(page, timestamp);

    const budgetId = await createPendingBudget(page, dependencies, timestamp);
    const consumeRequests = await collectConsumeRequests(page, budgetId);

    await page.route("**/budgets/**/confirm", async (route) => {
      const request = route.request();

      if (request.method() === "PUT" && apiPathEndsWith(request.url(), `budgets/${budgetId}/confirm`)) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusOk: false,
            message: "Confirmacion E2E fallida",
            error: { message: "Forzado por test" },
          }),
        });
        return;
      }

      await route.continue();
    });

    await openConfirmBudgetModal(page);
    await page.locator(".ui.modal").getByText("Entrega").click();
    await fillTestIdInput(page, "budget-confirm-delivery-product-0-quantity-field", "1");

    const confirmResponsePromise = page.waitForResponse((response) =>
      isApiResponse(response, "PUT", `budgets/${budgetId}/confirm`)
    );

    await page.locator(".ui.modal").getByTestId("modal-confirm").click();
    const confirmResponse = await confirmResponsePromise;
    const confirmBody = await getApiResponseBody(confirmResponse);

    expect(confirmBody.statusOk).toBe(false);
    await expect(page.locator(".ui.modal").getByTestId("modal-confirm")).toBeEnabled({ timeout: 30_000 });
    expect(consumeRequests).toHaveLength(0);
    await expect(page.getByText(/pendiente/i).first()).toBeVisible({ timeout: 30_000 });
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
