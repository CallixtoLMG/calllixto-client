import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import { E2E_ACCOUNTS } from "./support/env";
import { waitForEntityDetailUrl } from "./support/entities";

type ExpenseFixture = {
  name: string;
  amount: string;
  comments: string;
};

type PaymentFixture = {
  method?: string;
  amount: string;
  comments: string;
};

const expensesListUrl = /\/gastos(?:\?|$)/;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const apiPathEndsWith = (url: string, suffix: string) => new URL(url).pathname.endsWith(suffix);
const paymentApiPath = (expenseId: string) => `/payments/expense/${expenseId}`;

const expectSuccessfulApiResponse = async (response: Awaited<ReturnType<Page["waitForResponse"]>>) => {
  expect(response.status()).toBeLessThan(400);

  const body = await response.json();
  expect(body.statusOk).toBeTruthy();

  return body;
};

const getPaymentsByApi = async (
  page: Page,
  paymentResponseUrl: string,
  expenseId: string,
  authorization?: string,
) => {
  const url = paymentResponseUrl.replace(/\/payments\/expense\/[^/]+(?:\/[^/]+)?$/, paymentApiPath(expenseId));
  const response = await page.request.get(url, authorization ? { headers: { authorization } } : undefined);

  expect(response.status()).toBeLessThan(400);

  const body = await response.json();
  expect(Array.isArray(body.payments)).toBeTruthy();

  return body.payments as PaymentFixture[];
};

const openExpensesList = async (page: Page) => {
  await page.goto("/gastos");
  await expect(page).toHaveURL(expensesListUrl);
  await expect(page.getByTestId("nav-action-crear")).toBeVisible();
};

const selectFirstAvailableCategory = async (page: Page) => {
  const categoriesDropdown = page.getByTestId("dropdown-categories");
  await expect(categoriesDropdown).toBeVisible();
  await categoriesDropdown.click();

  const options = page
    .locator('[role="option"]')
    .filter({ visible: true })
    .filter({ hasNotText: /todos|no hay|no se encontraron/i });

  if (!(await options.count())) {
    await page.keyboard.press("Escape");
    return;
  }

  await options.nth(0).click();
};

const createExpenseForPayments = async (page: Page, expense: ExpenseFixture) => {
  await openExpensesList(page);
  await page.getByTestId("nav-action-crear").click();
  await expect(page).toHaveURL(/\/gastos\/crear(?:\?|$)/);

  await page.locator('input[name="name"]').fill(expense.name);
  await page.getByPlaceholder("18000").fill(expense.amount);
  await selectFirstAvailableCategory(page);
  await page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2").fill(expense.comments);
  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await waitForEntityDetailUrl(page, "gastos");

  return {
    id: new URL(page.url()).pathname.split("/")[2],
    url: page.url(),
  };
};

const openExpenseDetail = async (page: Page, expenseUrl: string, name: string) => {
  await page.goto(expenseUrl);
  await waitForEntityDetailUrl(page, "gastos");
  await expect(page.getByTestId("expense-name-field")).toContainText(name, { timeout: 30_000 });
};

const openPaymentsTab = async (page: Page) => {
  await page.getByText("Pagos", { exact: true }).click();
  await expect(page.getByText(/detalle de pagos/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("budget-add-payment-button")).toBeVisible();
};

const selectFirstPaymentMethod = async (page: Page) => {
  const dropdown = page.getByTestId("budget-payment-method-dropdown");
  await dropdown.click();

  const options = page
    .locator('[role="option"]')
    .filter({ visible: true })
    .filter({ hasNotText: /todos|no hay|no se encontraron|dolares/i });

  if (!(await options.count())) {
    throw new Error("Expense payments E2E requires at least one configured payment method.");
  }

  const option = options.nth(0);
  const method = (await option.innerText()).trim();
  await option.click();

  return method;
};

const selectPaymentMethod = async (page: Page, method: string) => {
  const dropdown = page.getByTestId("budget-payment-method-dropdown");
  await dropdown.click();
  await page.getByRole("option", { name: new RegExp(`^${escapeRegExp(method)}$`) }).click();

  return method;
};

const fillPaymentModal = async (page: Page, payment: PaymentFixture) => {
  const method = payment.method
    ? await selectPaymentMethod(page, payment.method)
    : await selectFirstPaymentMethod(page);

  await page.getByTestId("budget-payment-amount-field").locator("input").fill(payment.amount);
  await page.getByTestId("budget-payment-comments-field").fill(payment.comments);

  return { ...payment, method };
};

const addExpensePayment = async (page: Page, payment: PaymentFixture) => {
  await page.getByTestId("budget-add-payment-button").click();
  await expect(page.locator(".header").filter({ hasText: /agregar pago/i })).toBeVisible();

  const createdPayment = await fillPaymentModal(page, payment);
  await page.getByTestId("budget-payment-submit-button").click();
  await expect(page.getByText(/pago creado correctamente/i)).toBeVisible({ timeout: 30_000 });

  return createdPayment;
};

const paymentRow = (page: Page, payment: PaymentFixture) =>
  page.getByTestId("table-row").filter({ hasText: payment.comments });

const assertPaymentVisible = async (page: Page, payment: PaymentFixture) => {
  const row = paymentRow(page, payment);
  await expect(row).toBeVisible({ timeout: 30_000 });
  await expect(row).toContainText(payment.method ?? "");
  await expect(row).toContainText(payment.comments);
};

const assertPaymentNotVisible = async (page: Page, payment: PaymentFixture) => {
  await expect(paymentRow(page, payment)).toHaveCount(0, { timeout: 30_000 });
};

const openPaymentRowActions = async (page: Page, payment: PaymentFixture) => {
  const row = paymentRow(page, payment);
  await expect(row).toBeVisible({ timeout: 30_000 });
  await row.hover();
  await row.getByTestId("table-row-actions-trigger").click();
};

const editExpensePayment = async (page: Page, currentPayment: PaymentFixture, updatedPayment: PaymentFixture) => {
  await openPaymentRowActions(page, currentPayment);
  await page.getByTestId("table-row-action-2").click();
  await expect(page.locator(".header").filter({ hasText: /agregar pago/i })).toBeVisible();

  const editedPayment = await fillPaymentModal(page, updatedPayment);
  await page.getByTestId("budget-payment-submit-button").click();
  await expect(page.getByText(/pago actualizado/i)).toBeVisible({ timeout: 30_000 });

  return editedPayment;
};

const deleteExpensePayment = async (page: Page, payment: PaymentFixture) => {
  await openPaymentRowActions(page, payment);
  await page.getByTestId("table-row-action-1").click();
  await page.getByTestId("modal-confirmation-input").locator("input").fill("eliminar");
  await page.getByTestId("modal-confirm").click();
  await expect(page.getByText(/pago eliminado/i)).toBeVisible({ timeout: 30_000 });
};

const voidCurrentExpense = async (page: Page, reason: string) => {
  const voidButton = page.getByTestId("nav-action-anular");

  if (!(await voidButton.isVisible({ timeout: 5_000 }).catch(() => false))) return;

  await voidButton.click();
  await page.getByPlaceholder(/motivo/i).fill(reason);
  const confirmButton = page.getByTestId("modal-void");
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();
  await expect(page.getByText(reason)).toBeVisible({ timeout: 30_000 });
};

const voidExpenseIfPresent = async (page: Page, expenseUrl: string | null, reason: string) => {
  if (!expenseUrl) return;

  try {
    await page.goto(expenseUrl);
    await voidCurrentExpense(page, reason);
  } catch {
    // Best-effort cleanup: keep the original test failure as the useful signal.
  }
};

test.describe("expense payment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, { accountName: E2E_ACCOUNTS.modulesEnabled });
  });

  test("creates, updates, and deletes an expense payment", async ({ page }) => {
    test.setTimeout(180_000);

    const timestamp = Date.now();
    const expense = {
      name: `E2E Expense Payments ${timestamp}`,
      amount: "1500",
      comments: `Comentario E2E expense payments ${timestamp}`,
    };
    const initialPayment = {
      amount: "500",
      comments: `E2E payment comment ${timestamp}`,
    };
    const updatedPayment = {
      amount: "700",
      comments: `E2E payment comment updated ${timestamp}`,
    };
    const voidReason = `Cleanup E2E expense payments ${timestamp}`;
    let expenseUrl: string | null = null;

    try {
      const createdExpense = await createExpenseForPayments(page, expense);
      expenseUrl = createdExpense.url;

      await openExpenseDetail(page, expenseUrl, expense.name);
      await openPaymentsTab(page);

      const createdPayment = await addExpensePayment(page, initialPayment);
      await assertPaymentVisible(page, createdPayment);

      const editedPayment = await editExpensePayment(page, createdPayment, {
        ...updatedPayment,
        method: createdPayment.method,
      });
      await assertPaymentVisible(page, editedPayment);
      await assertPaymentNotVisible(page, createdPayment);

      await deleteExpensePayment(page, editedPayment);
      await assertPaymentNotVisible(page, editedPayment);

      await voidCurrentExpense(page, voidReason);
      expenseUrl = null;
    } finally {
      await voidExpenseIfPresent(page, expenseUrl, voidReason);
    }
  });

  test("clones an expense and manages payments on the clone", async ({ page }) => {
    const timestamp = Date.now();
    const originalExpense = {
      name: `E2E Expense Clone Pay Original ${timestamp}`,
      amount: "1500",
      comments: `Comentario E2E original clone pay ${timestamp}`,
    };
    const cloneName = `E2E Expense Clone Pay Clone ${timestamp}`;
    const cloneComment = `Comentario E2E clone pay ${timestamp}`;
    const originalPayment = {
      amount: "300",
      comments: `E2E original payment ${timestamp}`,
    };
    const originalVoidReason = `Cleanup E2E original clone pay ${timestamp}`;
    const cloneVoidReason = `Cleanup E2E clone pay ${timestamp}`;
    let originalExpenseUrl: string | null = null;
    let clonedExpenseUrl: string | null = null;

    try {
      const original = await createExpenseForPayments(page, originalExpense);
      originalExpenseUrl = original.url;

      await openExpenseDetail(page, original.url, originalExpense.name);
      await openPaymentsTab(page);
      const originalPaymentResponsePromise = page.waitForResponse((response) =>
        response.request().method() === "POST" &&
        apiPathEndsWith(response.url(), paymentApiPath(original.id)),
      );
      const createdOriginalPayment = await addExpensePayment(page, originalPayment);
      const originalPaymentResponse = await originalPaymentResponsePromise;
      await expectSuccessfulApiResponse(originalPaymentResponse);
      await assertPaymentVisible(page, createdOriginalPayment);
      const clonePayment = {
        method: createdOriginalPayment.method,
        amount: "400",
        comments: `E2E clone payment ${timestamp}`,
      };
      const editedClonePayment = {
        method: createdOriginalPayment.method,
        amount: "600",
        comments: `E2E clone payment edited ${timestamp}`,
      };

      await page.getByText("Gasto", { exact: true }).click();
      await page.getByTestId("nav-action-clonar").click();
      await expect(page).toHaveURL(/\/gastos\/crear\?clonar=/);
      await expect(page.locator('input[name="name"]')).toHaveValue(originalExpense.name);
      await expect(page.getByPlaceholder("18000")).toHaveValue("1,500");
      await expect(page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2")).toHaveValue(originalExpense.comments);

      await page.locator('input[name="name"]').fill(cloneName);
      await page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2").fill(cloneComment);
      const clonePostResponsePromise = page.waitForResponse((response) =>
        response.request().method() === "POST" && apiPathEndsWith(response.url(), "/expenses"),
      );
      await page.locator("form").getByRole("button", { name: /crear/i }).click();
      const clonePostBody = await expectSuccessfulApiResponse(await clonePostResponsePromise);
      await waitForEntityDetailUrl(page, "gastos");

      const cloneId = new URL(page.url()).pathname.split("/")[2];
      clonedExpenseUrl = page.url();
      expect(cloneId).not.toBe(original.id);
      expect(clonePostBody.expense.id).toBe(cloneId);

      await expect(page.getByTestId("expense-name-field")).toContainText(cloneName);
      await openPaymentsTab(page);
      await assertPaymentNotVisible(page, createdOriginalPayment);
      await expect(page.getByTestId("budget-add-payment-button")).toBeEnabled();
      await expect(page.getByText("1.500,00")).toHaveCount(2);

      const clonePaymentPostResponsePromise = page.waitForResponse((response) =>
        response.request().method() === "POST" &&
        apiPathEndsWith(response.url(), paymentApiPath(cloneId)),
      );
      const createdClonePayment = await addExpensePayment(page, clonePayment);
      await expectSuccessfulApiResponse(await clonePaymentPostResponsePromise);
      await assertPaymentVisible(page, createdClonePayment);
      await expect(page.getByText("1.100,00")).toBeVisible();

      const clonePaymentPutResponsePromise = page.waitForResponse((response) =>
        response.request().method() === "PUT" &&
        new URL(response.url()).pathname.includes(`${paymentApiPath(cloneId)}/`),
      );
      const editedPayment = await editExpensePayment(page, createdClonePayment, editedClonePayment);
      await expectSuccessfulApiResponse(await clonePaymentPutResponsePromise);
      await assertPaymentVisible(page, editedPayment);
      await assertPaymentNotVisible(page, createdClonePayment);
      await expect(page.getByText("900,00")).toBeVisible();

      const clonePaymentDeleteResponsePromise = page.waitForResponse((response) =>
        response.request().method() === "DELETE" &&
        new URL(response.url()).pathname.includes(`${paymentApiPath(cloneId)}/`),
      );
      await deleteExpensePayment(page, editedPayment);
      await expectSuccessfulApiResponse(await clonePaymentDeleteResponsePromise);
      await assertPaymentNotVisible(page, editedPayment);
      await expect(page.getByText("1.500,00")).toHaveCount(2);

      const originalPayments = await getPaymentsByApi(
        page,
        originalPaymentResponse.url(),
        original.id,
        originalPaymentResponse.request().headers().authorization,
      );
      expect(originalPayments.some(payment => payment.comments === createdOriginalPayment.comments)).toBeTruthy();
      expect(originalPayments.some(payment => payment.comments === editedPayment.comments)).toBeFalsy();

      await voidCurrentExpense(page, cloneVoidReason);
      clonedExpenseUrl = null;
      originalExpenseUrl = null;
    } finally {
      await voidExpenseIfPresent(page, clonedExpenseUrl, cloneVoidReason);
      await voidExpenseIfPresent(page, originalExpenseUrl, originalVoidReason);
    }
  });
});
