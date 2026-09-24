import { expect, test, type Page } from "@playwright/test";
import { expectSuccessfulApiResponse, getE2EApiJson, isApiResponse } from "./support/api";
import { confirmOpenCashBalance, openCashBalanceModal } from "./support/cashBalances";
import { loginAsE2EUser } from "./support/auth";
import { E2E_ACCOUNTS } from "./support/env";
import {
  addAddress,
  addPhone,
  dismissUnsavedChangesIfVisible,
  waitForCurrentRouteChunk,
  waitForEntityDetailUrl,
} from "./support/entities";

type CustomerFixture = {
  name: string;
  address: string;
};

type SupplierFixture = {
  id: string;
  name: string;
  comment: string;
};

type BrandFixture = {
  id: string;
  name: string;
  comment: string;
};

type ProductFixture = {
  localId: string;
  fullId: string;
  name: string;
  url: string;
};

type ProductOptions = {
  name?: string;
  cost?: string;
  price?: string;
  stockControl?: boolean;
};

type BudgetDependencies = {
  customer: CustomerFixture;
  product: ProductFixture;
};

type ProductResponse = {
  [key: string]: unknown;
  product?: {
    id?: string;
    stock?: number | string;
    stockControl?: boolean;
  };
};

type BudgetResponse = {
  [key: string]: unknown;
  budget?: {
    id?: string;
    state?: string;
    cancelledMsg?: string;
  };
};

type Payment = {
  id?: string;
  paymentId?: string;
  entity?: string;
  entityId?: string;
  method?: string;
  amount?: number | string;
  comments?: string;
};

type PaymentsResponse = {
  [key: string]: unknown;
  payments?: Payment[] | null;
};

type CashFlow = {
  id?: string;
  entity?: string;
  entityId?: string;
  cashBalanceId?: string;
  method?: string;
  amount?: number | string;
  comments?: string;
};

type CashBalanceResponse = {
  [key: string]: unknown;
  cashBalance?: {
    id?: string;
    currentAmount?: number | string;
    flows?: {
      budgets?: CashFlow[];
    };
  };
};

type StockFlow = {
  id?: string;
  budgetId?: string;
  productId?: string;
  quantity?: number | string;
  inflow?: boolean;
  comments?: string;
};

type StockFlowsResponse = {
  [key: string]: unknown;
  stockFlows?: StockFlow[];
};

type MoneyMovement = {
  id?: string;
  paymentId?: string;
  entityId?: string;
  method?: string;
  amount?: number | string;
  comments?: string;
};

const CANCEL_REVERSAL_COMMENT = "Venta cancelada.";

const responseEntityByApiPath: Record<string, string> = {
  customers: "customer",
  suppliers: "supplier",
  brands: "brand",
  products: "product",
};

const budgetsListUrl = /\/ventas(?:\?|$)/;
const confirmedBudgetUrl = /\/ventas\/(?!crear(?:\?|$))[^/]+(?:\?|$)/;
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

const createCustomerForBudgetIfNeeded = async (page: Page, timestamp: number): Promise<CustomerFixture> => {
  const customer = {
    name: `E2E Budget Customer ${timestamp}`,
    address: "Calle E2E Budget 123",
  };

  await page.goto("/clientes/crear");
  await expect(page).toHaveURL(/\/clientes\/crear(?:\?|$)/);
  await page.locator('input[name="name"]').fill(customer.name);
  await expect(page.locator('input[name="name"]')).toHaveValue(customer.name);
  await addPhone(page, { ref: "Casa", areaCode: "385", number: "5555555" });
  await addAddress(page, { ref: "Casa", address: customer.address });
  await submitCreateForm(page, "customers", "clientes");

  return customer;
};

const createSupplierForBudget = async (page: Page, timestamp: number, attempt: number): Promise<SupplierFixture> => {
  const supplier = {
    id: twoDigitIdWithAttempt(timestamp, attempt),
    name: `E2E Budget Action Supplier ${timestamp} ${attempt}`,
    comment: `Comentario E2E budget supplier ${timestamp} ${attempt}`,
  };

  await page.goto("/proveedores/crear");
  await expect(page).toHaveURL(/\/proveedores\/crear(?:\?|$)/);
  await page.locator('input[name="id"]').fill(supplier.id);
  await expect(page.locator('input[name="id"]')).toHaveValue(supplier.id);
  await page.locator('input[name="name"]').fill(supplier.name);
  await expect(page.locator('input[name="name"]')).toHaveValue(supplier.name);
  await page.getByPlaceholder("Siempre demora en los pedidos").fill(supplier.comment);
  await expect(page.getByPlaceholder("Siempre demora en los pedidos")).toHaveValue(supplier.comment);
  await submitCreateForm(page, "suppliers", "proveedores");

  return supplier;
};

const createBrandForBudget = async (page: Page, timestamp: number, attempt: number): Promise<BrandFixture> => {
  const brand = {
    id: twoDigitIdWithAttempt(timestamp + 37, attempt),
    name: `E2E Budget Action Brand ${timestamp} ${attempt}`,
    comment: `Comentario E2E budget brand ${timestamp} ${attempt}`,
  };

  await page.goto("/marcas/crear");
  await expect(page).toHaveURL(/\/marcas\/crear(?:\?|$)/);
  await page.locator('input[name="id"]').fill(brand.id);
  await expect(page.locator('input[name="id"]')).toHaveValue(brand.id);
  await page.locator('input[name="name"]').fill(brand.name);
  await expect(page.locator('input[name="name"]')).toHaveValue(brand.name);
  await page.getByPlaceholder("Una marca macanuda").fill(brand.comment);
  await expect(page.getByPlaceholder("Una marca macanuda")).toHaveValue(brand.comment);
  await submitCreateForm(page, "brands", "marcas");

  return brand;
};

const createProductForBudget = async (
  page: Page,
  timestamp: number,
  {
    name = `E2E Product Budget Action ${timestamp}`,
    cost = "1000",
    price = "1500",
    stockControl,
  }: ProductOptions = {},
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
      await fillTestIdInput(page, "product-cost-field", cost, "1,000");
      await fillTestIdInput(page, "product-price-field", price, "1,500");
      if (stockControl === true) {
        await page.getByTestId("product-stock-control-toggle").click();
      } else if (stockControl === false) {
        await page.getByTestId("product-stock-control-toggle").click();
        await page.getByTestId("product-stock-control-toggle").click();
      }
      await page.getByPlaceholder("Realmente son muchas pulgadas").fill(`Producto E2E para budget ${timestamp}`);
      await expect(page.getByPlaceholder("Realmente son muchas pulgadas")).toHaveValue(`Producto E2E para budget ${timestamp}`);
      await submitCreateForm(page, "products", "productos");

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

const createBudgetDependencies = async (page: Page, timestamp: number, productOptions: ProductOptions = {}): Promise<BudgetDependencies> => {
  const customer = await createCustomerForBudgetIfNeeded(page, timestamp);
  const product = await createProductForBudget(page, timestamp, productOptions);

  return { customer, product };
};

const getProductByApi = async (page: Page, productId: string) => {
  const body = await getE2EApiJson<ProductResponse>(page, `products/${productId}`);
  expect(body.product, JSON.stringify(body)).toBeTruthy();
  return body.product as NonNullable<ProductResponse["product"]>;
};

const getBudgetByApi = async (page: Page, budgetId: string) => {
  const body = await getE2EApiJson<BudgetResponse>(page, `budgets/${budgetId}`);
  expect(body.budget, JSON.stringify(body)).toBeTruthy();
  return body.budget as NonNullable<BudgetResponse["budget"]>;
};

const getPaymentsByBudgetApi = async (page: Page, budgetId: string) => {
  const body = await getE2EApiJson<PaymentsResponse>(page, `payments/budget/${budgetId}`);
  return body.payments ?? [];
};

const getCashBalanceByApi = async (page: Page, cashBalanceId: string) => {
  const body = await getE2EApiJson<CashBalanceResponse>(page, `cash-balances/${cashBalanceId}`);
  expect(body.cashBalance, JSON.stringify(body)).toBeTruthy();
  return body.cashBalance as NonNullable<CashBalanceResponse["cashBalance"]>;
};

const getStockFlowsByBudgetApi = async (page: Page, budgetId: string) => {
  const body = await getE2EApiJson<StockFlowsResponse>(
    page,
    `stock-flows?sort=budgetId&budgetId=${encodeURIComponent(budgetId)}`,
  );

  return Array.isArray(body) ? body as StockFlow[] : body.stockFlows ?? [];
};

const numberValue = (value: number | string | undefined) => Number(value ?? 0);

const movementId = (movement: MoneyMovement) => movement.id ?? movement.paymentId;

const findById = <T extends MoneyMovement>(items: T[], id: string) =>
  items.find((item) => movementId(item) === id);

const expectMoneyClose = (actual: number | string | undefined, expected: number) => {
  expect(numberValue(actual)).toBeCloseTo(expected, 2);
};

const moneyEquals = (actual: number | string | undefined, expected: number) =>
  Math.abs(numberValue(actual) - expected) < 0.01;

const openCashBalanceForBudgetCancel = async (page: Page, timestamp: number) => {
  const comment = `E2E Budget Cancel Cash Balance ${timestamp}`;

  await openCashBalanceModal(page);
  await page.getByTestId("cash-balance-select-all-payment-methods").click();
  await expect(page.locator('input[value="Todos"]')).toBeVisible();
  await page.getByTestId("cash-balance-initial-amount-field").locator("input").fill("1000");
  await page.getByTestId("cash-balance-comments-field").fill(comment);

  return confirmOpenCashBalance(page, comment);
};

const addInitialStock = async (page: Page, product: ProductFixture, quantity: number, timestamp: number) => {
  await page.goto(product.url);
  await waitForEntityDetailUrl(page, "productos");
  await page.locator(".ui.tabular.menu .item").filter({ hasText: /^Control de stock$/ }).click();
  await expect(page.getByText(/movimientos de stock/i)).toBeVisible({ timeout: 30_000 });

  await page.getByTestId("stock-add-button").click();
  await fillTestIdInput(page, "stock-quantity-field", String(quantity));
  await fillTestIdInput(page, "stock-comments-field", `Stock inicial E2E cancel budget ${timestamp}`);

  const responsePromise = page.waitForResponse((response) =>
    isApiResponse(response, "POST", `stock-flows/${product.fullId}`),
  );

  await Promise.all([
    responsePromise,
    page.getByTestId("modal-confirm").click(),
  ]);

  await expectSuccessfulApiResponse(await responsePromise, { responseEntity: "stockFlow" });
  await expect.poll(async () => numberValue((await getProductByApi(page, product.fullId)).stock), {
    timeout: 30_000,
  }).toBe(quantity);
};

const selectFirstPaymentMethod = async (page: Page) => {
  await page.getByTestId("budget-payment-method-dropdown").click();
  const option = page
    .locator('[role="option"]')
    .filter({ visible: true })
    .filter({ hasNotText: /todos|sin resultados|no hay|no se encontraron|dolares/i })
    .first();

  await expect(option).toBeVisible({ timeout: 30_000 });
  const method = (await option.innerText()).trim();
  await option.click();

  return method;
};

const addBudgetPayment = async (page: Page, budgetId: string, amount: number, timestamp: number) => {
  const comments = `Pago E2E cancel budget ${timestamp}`;

  await page.getByTestId("budget-detail-tab-payments").click();
  await expect(page.getByText(/detalle de pagos/i)).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("budget-add-payment-button").click();
  await expect(page.locator(".ui.modal").getByText(/^agregar pago$/i)).toBeVisible({ timeout: 30_000 });

  const method = await selectFirstPaymentMethod(page);
  await page.getByTestId("budget-payment-amount-field").locator("input").fill(String(amount));
  await page.getByTestId("budget-payment-comments-field").fill(comments);

  const responsePromise = page.waitForResponse((response) =>
    isApiResponse(response, "POST", `payments/budget/${budgetId}`),
  );

  await Promise.all([
    responsePromise,
    page.getByTestId("budget-payment-submit-button").click(),
  ]);

  const body = await expectSuccessfulApiResponse(await responsePromise, { responseEntity: "payment" });
  const payment = body.payment as Payment;
  const id = movementId(payment);
  expect(id, JSON.stringify(body)).toBeTruthy();

  await expect(page.getByTestId("table-row").filter({ hasText: comments })).toBeVisible({ timeout: 30_000 });

  return {
    id: id as string,
    entity: payment.entity,
    entityId: payment.entityId,
    method: payment.method ?? method,
    amount: numberValue(payment.amount ?? amount),
    comments: payment.comments ?? comments,
  };
};

const completeBudgetDelivery = async (
  page: Page,
  budgetId: string,
  product: ProductFixture,
  quantity: number,
  timestamp: number,
) => {
  await page.getByTestId("budget-detail-tab-deliveries").click();
  await page.getByTestId("budget-open-delivery-modal-button").click();
  const modal = page.locator(".ui.modal").filter({ hasText: /registrar entrega/i });
  await expect(modal).toBeVisible({ timeout: 30_000 });

  await page.getByTestId("budget-delivery-note-field").locator("input").fill(`R-${timestamp}`);
  const row = modal.getByRole("row").filter({ hasText: product.name });
  await expect(row).toBeVisible({ timeout: 30_000 });
  await row.locator("input").first().fill(String(quantity));

  const responsePromise = page.waitForResponse((response) =>
    isApiResponse(response, "POST", `stock-flows/${budgetId}/consume`),
  );

  await Promise.all([
    responsePromise,
    page.getByTestId("modal-confirm").click(),
  ]);

  await expectSuccessfulApiResponse(await responsePromise);
  await expect(modal).not.toBeVisible({ timeout: 30_000 });
};

const expectSingleMoneyReversal = <T extends MoneyMovement>(
  movements: T[],
  original: T,
  matchesSource: (movement: T) => boolean,
) => {
  const reversals = movements.filter((movement) =>
    movementId(movement) &&
    movementId(movement) !== movementId(original) &&
    movement.entityId === original.entityId &&
    movement.method === original.method &&
    movement.comments === CANCEL_REVERSAL_COMMENT &&
    moneyEquals(movement.amount, -numberValue(original.amount)) &&
    matchesSource(movement)
  );

  expect(reversals, JSON.stringify(movements)).toHaveLength(1);
  const reversal = reversals[0];
  expect(movementId(reversal), JSON.stringify(reversal)).not.toBe(movementId(original));
  expect(reversal.entityId, JSON.stringify(reversal)).toBe(original.entityId);
  expect(reversal.method, JSON.stringify(reversal)).toBe(original.method);
  expectMoneyClose(reversal.amount, -numberValue(original.amount));
  expect(reversal.comments, JSON.stringify(reversal)).toBe(CANCEL_REVERSAL_COMMENT);

  return reversal;
};

const budgetCashFlows = (cashBalance: NonNullable<CashBalanceResponse["cashBalance"]>, budgetId: string) =>
  (cashBalance.flows?.budgets ?? []).filter((flow) => flow.entityId === budgetId);

const findStockFlowReversal = (stockFlows: StockFlow[], original: StockFlow) =>
  stockFlows.filter((flow) =>
    flow.id &&
    flow.id !== original.id &&
    flow.budgetId === original.budgetId &&
    flow.productId === original.productId &&
    flow.inflow === true &&
    flow.comments === CANCEL_REVERSAL_COMMENT &&
    numberValue(flow.quantity) === numberValue(original.quantity)
  );

const openCreateBudgetPage = async (page: Page) => {
  await page.goto("/ventas");
  await expect(page).toHaveURL(budgetsListUrl);
  await page.goto("/ventas/crear");
  await expect(page).toHaveURL(/\/ventas\/crear(?:\?|$)/);
  await waitForCurrentRouteChunk(page);
  await expect(page.getByTestId("budget-customer-search")).toBeVisible({ timeout: 30_000 });
};

const expectBudgetDetailState = async (page: Page, state: "Confirmado" | "Pendiente") => {
  const budgetId = new URL(page.url()).pathname.split("/")[2];
  await expect(page.locator("main")).toContainText(new RegExp(`${budgetId}[\\s\\S]*${state}`, "i"), { timeout: 30_000 });
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
  await fillBudgetForm(page, dependencies, timestamp);
  await page.getByTestId("budget-state-confirmed-button").click();
  await page.getByTestId("budget-submit-current-state-button").click();
  await expect(page).toHaveURL(confirmedBudgetUrl, { timeout: 30_000 });
  await expectBudgetDetailState(page, "Confirmado");

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
  await expectBudgetDetailState(page, "Confirmado");
};

const voidCurrentBudget = async (page: Page, reason: string) => {
  const budgetId = new URL(page.url()).pathname.split("/")[2];

  await page.getByTestId("nav-action-anular venta").click();
  await expect(page.getByText(/desea anular el presupuesto/i)).toBeVisible({ timeout: 30_000 });
  await page.getByPlaceholder(/motivo/i).fill(reason);
  await expect(page.getByPlaceholder(/motivo/i)).toHaveValue(reason);

  const voidButton = page.getByTestId("modal-void");
  await expect(voidButton).toBeEnabled();

  const cancelResponsePromise = page.waitForResponse((response) =>
    isApiResponse(response, "PUT", `budgets/${budgetId}/cancel`),
  );

  await Promise.all([
    cancelResponsePromise,
    voidButton.click(),
  ]);

  const cancelBody = await expectSuccessfulApiResponse(await cancelResponsePromise, { responseEntity: "budget" });
  expect((cancelBody.budget as { state?: string })?.state, JSON.stringify(cancelBody)).toBe("CANCELLED");
  expect((cancelBody.budget as { cancelledMsg?: string })?.cancelledMsg, JSON.stringify(cancelBody)).toBe(reason);

  await expect(page.getByText(/desea anular el presupuesto/i)).toBeHidden({ timeout: 30_000 });
  await expect(page.getByText(/motivo de anulaci.n/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(reason)).toBeVisible();
  await expect(page.getByTestId("nav-action-anular venta")).toBeHidden();
};

const updateProductForCloneModal = async (page: Page, product: ProductFixture, timestamp: number) => {
  await page.goto(product.url);
  await waitForEntityDetailUrl(page, "productos");
  await expect(page.getByTestId("product-name-field")).toContainText(product.name, { timeout: 30_000 });
  await page.getByRole("button", { name: /^actualizar$/i }).first().click();
  await fillTestIdInput(page, "product-cost-field", "1200", "1,200");
  await fillTestIdInput(page, "product-price-field", "1800", "1,800");
  await page.getByPlaceholder("Realmente son muchas pulgadas").fill(`Producto actualizado para test de clonacion ${timestamp}`);
  const updateResponsePromise = page.waitForResponse((response) =>
    isApiResponse(response, "PUT", `products/${product.fullId}`),
  );
  await page.locator("form").getByRole("button", { name: /^actualizar$/i }).click();
  await expectSuccessfulApiResponse(await updateResponsePromise, { responseEntity: "product", expectedId: product.fullId });
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

const assertProductChangesModalDoesNotReopenAfterTabRoundTrip = async (page: Page) => {
  const modal = page.getByTestId("budget-product-updates-modal");
  const tabs = page.locator(".ui.tabular.menu .item");

  await expect(modal).toBeHidden({ timeout: 30_000 });
  await page.getByTestId("budget-state-confirmed-button").click();
  await expect(tabs.filter({ hasText: /^Pagos$/ })).toBeVisible({ timeout: 30_000 });
  await tabs.filter({ hasText: /^Pagos$/ }).click();
  await expect(modal).toBeHidden({ timeout: 30_000 });
  await tabs.filter({ hasText: /^Venta$/ }).click();
  await expect(modal).toBeHidden({ timeout: 30_000 });
};

const completeRequiredCloneFields = async (page: Page, dependencies: BudgetDependencies, timestamp: number) => {
  await fillTestIdInput(page, "budget-expiration-days-field", "7");
  await selectSearchOption(page, "budget-customer-search", dependencies.customer.name);
  await page.getByTestId("textarea-comments").fill(`Comentario E2E budget clonado ${timestamp}`);
  await page.getByTestId("budget-state-confirmed-button").click();
};

const confirmClonedBudget = async (page: Page) => {
  await page.getByTestId("budget-submit-current-state-button").click();
  await expect(page).toHaveURL(confirmedBudgetUrl, { timeout: 30_000 });
  await expectBudgetDetailState(page, "Confirmado");
};

test.describe("budget actions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, { accountName: E2E_ACCOUNTS.modulesEnabled });
  });

  test("voids a confirmed budget without stock control", async ({ page }) => {
    test.setTimeout(180_000);

    const timestamp = Date.now();
    const dependencies = await createBudgetDependencies(page, timestamp, { stockControl: false });
    const productWithoutStockControl = await getProductByApi(page, dependencies.product.fullId);
    expect(productWithoutStockControl.stockControl, JSON.stringify(productWithoutStockControl)).toBe(false);
    const budget = await createConfirmedBudgetWithProduct(page, dependencies, timestamp);

    await openBudgetDetail(page, budget.url, { reload: true });
    await voidCurrentBudget(page, `Motivo E2E anulacion budget ${timestamp}`);
    const stockFlowsAfterCancel = await getStockFlowsByBudgetApi(page, budget.id);
    expect(stockFlowsAfterCancel).toHaveLength(0);
  });

  test("voids a confirmed budget with stock control and reverts related movements", async ({ page }) => {
    test.setTimeout(300_000);

    const timestamp = Date.now();
    const initialStock = 20;
    const deliveredQuantity = 1;
    const paymentAmount = 50;
    const voidReason = `Motivo E2E anulacion budget stock ${timestamp}`;

    const dependencies = await createBudgetDependencies(page, timestamp, {
      name: `E2E Product Budget Stock Cancel ${timestamp}`,
      stockControl: true,
    });
    const cashBalance = await openCashBalanceForBudgetCancel(page, timestamp);
    const cashBalanceBeforePayment = await getCashBalanceByApi(page, cashBalance.id);
    const cashBeforePayment = numberValue(cashBalanceBeforePayment.currentAmount);

    await addInitialStock(page, dependencies.product, initialStock, timestamp);
    const productBeforeDelivery = await getProductByApi(page, dependencies.product.fullId);
    expect(productBeforeDelivery.stockControl, JSON.stringify(productBeforeDelivery)).toBe(true);
    expect(numberValue(productBeforeDelivery.stock)).toBe(initialStock);

    const budget = await createConfirmedBudgetWithProduct(page, dependencies, timestamp);
    const confirmedBudget = await getBudgetByApi(page, budget.id);
    expect(confirmedBudget.state, JSON.stringify(confirmedBudget)).toBe("CONFIRMED");

    const createdPayment = await addBudgetPayment(page, budget.id, paymentAmount, timestamp);
    const paymentsBeforeCancel = await getPaymentsByBudgetApi(page, budget.id);
    const originalPayment = findById(paymentsBeforeCancel, createdPayment.id);
    expect(originalPayment, JSON.stringify(paymentsBeforeCancel)).toBeTruthy();
    expect(originalPayment?.entity, JSON.stringify(originalPayment)).toBe("BUDGET");
    expect(originalPayment?.entityId, JSON.stringify(originalPayment)).toBe(budget.id);
    expect(originalPayment?.method, JSON.stringify(originalPayment)).toBe(createdPayment.method);
    expect(numberValue(originalPayment?.amount), JSON.stringify(originalPayment)).toBeGreaterThan(0);
    expectMoneyClose(originalPayment?.amount, createdPayment.amount);

    await expect.poll(async () => numberValue((await getCashBalanceByApi(page, cashBalance.id)).currentAmount), {
      timeout: 30_000,
    }).toBeCloseTo(cashBeforePayment + createdPayment.amount, 2);

    const cashBalanceAfterPayment = await getCashBalanceByApi(page, cashBalance.id);
    const originalCashFlowMatches = budgetCashFlows(cashBalanceAfterPayment, budget.id).filter((flow) =>
      flow.entity === "BUDGET" &&
      flow.cashBalanceId === cashBalance.id &&
      flow.method === createdPayment.method &&
      moneyEquals(flow.amount, createdPayment.amount)
    );
    expect(originalCashFlowMatches, JSON.stringify(cashBalanceAfterPayment.flows?.budgets)).toHaveLength(1);
    const originalCashFlow = originalCashFlowMatches[0];
    expect(originalCashFlow.id, JSON.stringify(originalCashFlow)).toBeTruthy();

    await completeBudgetDelivery(page, budget.id, dependencies.product, deliveredQuantity, timestamp);
    await expect.poll(async () => numberValue((await getProductByApi(page, dependencies.product.fullId)).stock), {
      timeout: 30_000,
    }).toBe(initialStock - deliveredQuantity);

    const productAfterDelivery = await getProductByApi(page, dependencies.product.fullId);
    expect(numberValue(productAfterDelivery.stock)).toBe(initialStock - deliveredQuantity);

    const stockFlowsBeforeCancel = await getStockFlowsByBudgetApi(page, budget.id);
    const originalStockFlowMatches = stockFlowsBeforeCancel.filter((flow) =>
      flow.budgetId === budget.id &&
      flow.productId === dependencies.product.fullId &&
      flow.inflow === false &&
      numberValue(flow.quantity) === deliveredQuantity
    );
    expect(originalStockFlowMatches, JSON.stringify(stockFlowsBeforeCancel)).toHaveLength(1);
    const originalStockFlow = originalStockFlowMatches[0];
    expect(originalStockFlow.id, JSON.stringify(originalStockFlow)).toBeTruthy();

    await openBudgetDetail(page, budget.url, { reload: true });
    await voidCurrentBudget(page, voidReason);

    const cancelledBudget = await getBudgetByApi(page, budget.id);
    expect(cancelledBudget.state, JSON.stringify(cancelledBudget)).toBe("CANCELLED");
    expect(cancelledBudget.cancelledMsg, JSON.stringify(cancelledBudget)).toBe(voidReason);

    const productAfterCancel = await getProductByApi(page, dependencies.product.fullId);
    expect(numberValue(productAfterCancel.stock)).toBe(initialStock);

    const cashBalanceAfterCancel = await getCashBalanceByApi(page, cashBalance.id);
    expectMoneyClose(cashBalanceAfterCancel.currentAmount, cashBeforePayment);

    const paymentsAfterCancel = await getPaymentsByBudgetApi(page, budget.id);
    const preservedPayment = findById(paymentsAfterCancel, createdPayment.id);
    expect(preservedPayment, JSON.stringify(paymentsAfterCancel)).toBeTruthy();
    const paymentReversal = expectSingleMoneyReversal(
      paymentsAfterCancel,
      originalPayment as Payment,
      (payment) => payment.entity === originalPayment?.entity,
    );
    expect(paymentReversal.entity, JSON.stringify(paymentReversal)).toBe("BUDGET");

    const cashFlowsAfterCancel = budgetCashFlows(cashBalanceAfterCancel, budget.id);
    const preservedCashFlow = findById(cashFlowsAfterCancel, originalCashFlow.id as string);
    expect(preservedCashFlow, JSON.stringify(cashFlowsAfterCancel)).toBeTruthy();
    const cashFlowReversal = expectSingleMoneyReversal(
      cashFlowsAfterCancel,
      originalCashFlow,
      (flow) => flow.cashBalanceId === originalCashFlow.cashBalanceId,
    );
    expect(cashFlowReversal.cashBalanceId, JSON.stringify(cashFlowReversal)).toBe(cashBalance.id);

    const stockFlowsAfterCancel = await getStockFlowsByBudgetApi(page, budget.id);
    const preservedStockFlow = findById(stockFlowsAfterCancel, originalStockFlow.id as string);
    expect(preservedStockFlow, JSON.stringify(stockFlowsAfterCancel)).toBeTruthy();
    expect(preservedStockFlow?.inflow, JSON.stringify(preservedStockFlow)).toBe(false);
    expect(numberValue(preservedStockFlow?.quantity), JSON.stringify(preservedStockFlow)).toBe(deliveredQuantity);
    const stockFlowReversals = findStockFlowReversal(stockFlowsAfterCancel, originalStockFlow);
    expect(stockFlowReversals, JSON.stringify(stockFlowsAfterCancel)).toHaveLength(1);
    const stockFlowReversal = stockFlowReversals[0];
    expect(stockFlowReversal.id, JSON.stringify(stockFlowReversal)).not.toBe(originalStockFlow.id);
    expect(stockFlowReversal.budgetId, JSON.stringify(stockFlowReversal)).toBe(budget.id);
    expect(stockFlowReversal.productId, JSON.stringify(stockFlowReversal)).toBe(dependencies.product.fullId);
    expect(stockFlowReversal.inflow, JSON.stringify(stockFlowReversal)).toBe(true);
    expect(numberValue(stockFlowReversal.quantity), JSON.stringify(stockFlowReversal)).toBe(deliveredQuantity);
    expect(stockFlowReversal.comments, JSON.stringify(stockFlowReversal)).toBe(CANCEL_REVERSAL_COMMENT);
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
    await chooseUpdateProductValues(page);
    await assertBudgetProductPrice(page, "1800");
    await completeRequiredCloneFields(page, dependencies, timestamp);
    await assertProductChangesModalDoesNotReopenAfterTabRoundTrip(page);
    await confirmClonedBudget(page);

    await openBudgetDetail(page, budget.url, { reload: true });
    await cloneCurrentBudget(page);
    await assertProductChangesModalVisible(page, product);
    await chooseKeepPreviousProductValues(page);
    await assertBudgetProductPrice(page, "1500");
    await assertProductChangesModalDoesNotReopenAfterTabRoundTrip(page);
  });
});
