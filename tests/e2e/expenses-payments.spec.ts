import { expect, test, type Page } from "@playwright/test";
import {
  apiPathEndsWith,
  expectSuccessfulApiResponse,
  getE2EAccountApiUrl,
  getE2EApiHeaders,
  isApiResponse,
} from "./support/api";
import { loginAsE2EUser } from "./support/auth";
import { E2E_ACCOUNTS } from "./support/env";
import { waitForEntityDetailUrl, waitForExpenseSettingsReady } from "./support/entities";

type ExpenseFixture = {
  name: string;
  amount: string;
  comments: string;
};

type PaymentFixture = {
  id?: string;
  paymentId?: string;
  method?: string;
  amount: string;
  comments: string;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const paymentApiPath = (expenseId: string) => `/payments/expense/${expenseId}`;
const currentExpenseId = (page: Page) => new URL(page.url()).pathname.split("/")[2];

const waitForPaymentsRefresh = async (page: Page, expenseId = currentExpenseId(page)) => {
  const response = await page.waitForResponse((response) =>
    response.request().method() === "GET" &&
    apiPathEndsWith(response.url(), paymentApiPath(expenseId)),
  );

  expect(response.status()).toBeLessThan(400);

  return response;
};

const postE2EApi = async <TBody extends Record<string, unknown>>(
  page: Page,
  path: string,
  payload: Record<string, unknown>,
  responseEntity: string,
) => {
  const response = await page.request.post(getE2EAccountApiUrl(path), {
    data: payload,
    headers: await getE2EApiHeaders(page),
  });

  return expectSuccessfulApiResponse(response, { responseEntity }) as Promise<TBody>;
};

const createExpenseByApi = async (page: Page, expense: ExpenseFixture) => {
  const body = await postE2EApi<{ expense: ExpenseFixture & { id: string } }>(
    page,
    "expenses",
    {
      ...expense,
      amount: Number(expense.amount),
      expirationDate: new Date().toISOString(),
      paymentsMade: [],
      tags: [],
      categories: [],
    },
    "expense",
  );

  return {
    id: body.expense.id,
    url: `/gastos/${body.expense.id}`,
  };
};

const getFirstPaymentMethodByApi = async (page: Page) => {
  const response = await page.request.get(getE2EAccountApiUrl("settings"), {
    headers: await getE2EApiHeaders(page),
  });

  expect(response.status()).toBeLessThan(400);

  const body = await response.json();
  const generalSettings = body.settings?.find((setting: { id?: string }) => setting.id === "GENERAL");
  const method = generalSettings?.paymentMethods?.find((paymentMethod: string) => !/dolares/i.test(paymentMethod));
  expect(method, JSON.stringify(body)).toBeTruthy();

  return method as string;
};

const createPaymentByApi = async (page: Page, expenseId: string, payment: PaymentFixture) => {
  const body = await postE2EApi<{ payment: PaymentFixture }>(
    page,
    paymentApiPath(expenseId),
    {
      ...payment,
      amount: Number(payment.amount),
      date: new Date().toISOString(),
    },
    "payment",
  );

  return {
    ...payment,
    id: body.payment.id ?? body.payment.paymentId,
    paymentId: body.payment.paymentId ?? body.payment.id,
    method: body.payment.method ?? payment.method,
  };
};

const deletePaymentByApi = async (page: Page, expenseId: string, payment: PaymentFixture) => {
  const paymentId = payment.id ?? payment.paymentId;
  expect(paymentId).toBeTruthy();

  const response = await page.request.delete(getE2EAccountApiUrl(`${paymentApiPath(expenseId)}/${paymentId}`), {
    headers: await getE2EApiHeaders(page),
  });

  return expectSuccessfulApiResponse(response);
};

const voidExpenseByApi = async (page: Page, expenseUrl: string, reason: string) => {
  const expenseId = new URL(expenseUrl, page.url()).pathname.split("/")[2];
  const response = await page.request.put(getE2EAccountApiUrl(`expenses/${expenseId}/cancel`), {
    data: {
      cancelledBy: "E2E",
      cancelledAt: new Date().toISOString(),
      cancelledMsg: reason,
    },
    headers: await getE2EApiHeaders(page),
  });

  return expectSuccessfulApiResponse(response, { responseEntity: "expense" });
};

const voidExpenseByApiIfPresent = async (page: Page, expenseUrl: string | null, reason: string) => {
  if (!expenseUrl) return;

  try {
    await voidExpenseByApi(page, expenseUrl, reason);
  } catch {
    // Best-effort cleanup: keep the original test failure as the useful signal.
  }
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
  await page.goto("/gastos/crear");
  await expect(page).toHaveURL(/\/gastos\/crear(?:\?|$)/);
  await waitForExpenseSettingsReady(page);

  await page.locator('input[name="name"]').fill(expense.name);
  await page.getByPlaceholder("18000").fill(expense.amount);
  await selectFirstAvailableCategory(page);
  await page.getByPlaceholder("Quiero ver el Juego del Calamar temporada 2").fill(expense.comments);
  const createResponsePromise = page.waitForResponse((response) => isApiResponse(response, "POST", "expenses"));
  const createButton = page.locator("form").getByRole("button", { name: /crear/i });
  await expect(createButton).toBeEnabled();
  await createButton.click();
  const createBody = await expectSuccessfulApiResponse(await createResponsePromise, { responseEntity: "expense" });
  await waitForEntityDetailUrl(page, "gastos");
  expect(new URL(page.url()).pathname).toBe(`/gastos/${createBody.expense.id}`);

  return {
    id: createBody.expense.id,
    url: page.url(),
  };
};

const openExpenseDetail = async (page: Page, expenseUrl: string, name: string) => {
  if (new URL(page.url()).pathname !== new URL(expenseUrl, page.url()).pathname) {
    await page.goto(expenseUrl, { waitUntil: "domcontentloaded" });
  }

  await waitForEntityDetailUrl(page, "gastos");
  await expect(page.getByTestId("expense-name-field")).toContainText(name, { timeout: 30_000 });
};

const openPaymentsTab = async (page: Page) => {
  const paymentsTab = page.locator(".ui.tabular.menu .item").filter({ hasText: /^Pagos$/ });
  const addPaymentButton = page.getByTestId("budget-add-payment-button");
  await expect(paymentsTab).toBeVisible();
  await paymentsTab.click();

  if (!(await addPaymentButton.isVisible().catch(() => false))) {
    const url = new URL(page.url());
    await page.goto(`${url.pathname}?tab=pagos`, { waitUntil: "domcontentloaded" });
  }

  await expect(addPaymentButton).toBeVisible();
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
  await expect(dropdown).toBeVisible();

  if ((await dropdown.innerText()).includes(method)) {
    return method;
  }

  await expect(dropdown).toBeEnabled();
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
  const paymentModal = page.locator(".ui.modal").filter({ hasText: /agregar pago/i });
  const addButton = page.getByTestId("budget-add-payment-button");
  await expect(addButton).toBeEnabled();
  await addButton.click();
  await expect(paymentModal).toBeVisible();

  const createdPayment = await fillPaymentModal(page, payment);
  const paymentPostResponsePromise = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    apiPathEndsWith(response.url(), paymentApiPath(currentExpenseId(page))),
  );
  const paymentsRefreshPromise = waitForPaymentsRefresh(page);
  await page.getByTestId("budget-payment-submit-button").click();
  const paymentPostBody = await expectSuccessfulApiResponse(await paymentPostResponsePromise, { responseEntity: "payment" });
  await expect(page.getByText(/pago creado correctamente/i)).toBeVisible({ timeout: 30_000 });
  await paymentsRefreshPromise;
  await expect(paymentModal).toBeHidden();

  return {
    ...createdPayment,
    id: paymentPostBody.payment.id ?? paymentPostBody.payment.paymentId,
    paymentId: paymentPostBody.payment.paymentId ?? paymentPostBody.payment.id,
  };
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
  const paymentModal = page.locator(".ui.modal").filter({ hasText: /agregar pago/i });
  await openPaymentRowActions(page, currentPayment);
  await page.getByTestId("table-row-action-2").click();
  await expect(paymentModal).toBeVisible();

  const editedPayment = await fillPaymentModal(page, updatedPayment);
  const paymentId = currentPayment.id ?? currentPayment.paymentId;
  const paymentPutResponsePromise = page.waitForResponse((response) =>
    response.request().method() === "PUT" &&
    new URL(response.url()).pathname.includes(`${paymentApiPath(currentExpenseId(page))}/${paymentId}`),
  );
  const paymentsRefreshPromise = waitForPaymentsRefresh(page);
  await page.getByTestId("budget-payment-submit-button").click();
  const paymentPutBody = await expectSuccessfulApiResponse(await paymentPutResponsePromise, { responseEntity: "payment" });
  await expect(page.getByText(/pago actualizado/i)).toBeVisible({ timeout: 30_000 });
  await paymentsRefreshPromise;
  await expect(paymentModal).toBeHidden();

  return {
    ...currentPayment,
    ...editedPayment,
    id: paymentPutBody.payment.id ?? paymentPutBody.payment.paymentId ?? currentPayment.id,
    paymentId: paymentPutBody.payment.paymentId ?? paymentPutBody.payment.id ?? currentPayment.paymentId,
  };
};

const deleteExpensePayment = async (page: Page, payment: PaymentFixture) => {
  await openPaymentRowActions(page, payment);
  await page.getByTestId("table-row-action-1").click();
  const confirmationInput = page.getByTestId("modal-confirmation-input").locator("input");
  await confirmationInput.fill("eliminar");
  await expect(page.getByTestId("modal-confirm")).toBeEnabled();
  const paymentsRefreshPromise = waitForPaymentsRefresh(page);
  await confirmationInput.press("Enter");
  await expect(page.getByText(/pago eliminado/i)).toBeVisible({ timeout: 30_000 });
  await paymentsRefreshPromise;
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
      const original = await createExpenseByApi(page, originalExpense);
      originalExpenseUrl = original.url;
      const originalPaymentMethod = await getFirstPaymentMethodByApi(page);
      const createdOriginalPayment = await createPaymentByApi(page, original.id, {
        ...originalPayment,
        method: originalPaymentMethod,
      });

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

      const clone = await createExpenseByApi(page, {
        name: cloneName,
        amount: originalExpense.amount,
        comments: cloneComment,
      });
      const cloneId = clone.id;
      clonedExpenseUrl = clone.url;
      expect(cloneId).not.toBe(original.id);

      await openExpenseDetail(page, clone.url, cloneName);
      await openPaymentsTab(page);
      await assertPaymentNotVisible(page, createdOriginalPayment);
      await expect(page.getByTestId("budget-add-payment-button")).toBeEnabled();
      await expect(page.getByText("1.500,00")).toHaveCount(2);

      const createdClonePayment = await addExpensePayment(page, clonePayment);
      await assertPaymentVisible(page, createdClonePayment);
      await expect(page.getByText("1.100,00")).toBeVisible();

      const editedPayment = await editExpensePayment(page, createdClonePayment, editedClonePayment);
      await assertPaymentVisible(page, editedPayment);
      await assertPaymentNotVisible(page, createdClonePayment);
      await expect(page.getByText("900,00")).toBeVisible();

      await deletePaymentByApi(page, cloneId, editedPayment);

      await voidExpenseByApi(page, clonedExpenseUrl, cloneVoidReason);
      clonedExpenseUrl = null;
      await voidExpenseByApi(page, originalExpenseUrl, originalVoidReason);
      originalExpenseUrl = null;
    } finally {
      await voidExpenseByApiIfPresent(page, clonedExpenseUrl, cloneVoidReason);
      await voidExpenseByApiIfPresent(page, originalExpenseUrl, originalVoidReason);
    }
  });
});
