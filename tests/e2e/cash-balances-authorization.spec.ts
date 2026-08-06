import { expect, test, type Response } from "@playwright/test";
import { isApiResponse } from "./support/api";
import { loginAsE2EUser } from "./support/auth";
import { openCashBalanceModal } from "./support/cashBalances";
import { E2E_ACCOUNTS } from "./support/env";

type CashBalanceResponseBody = {
  statusOk?: boolean;
  message?: string;
  error?: {
    name?: string;
    status?: number;
    message?: string;
  };
  cashBalance?: {
    id?: string;
  };
};

const isCreateCashBalanceResponse = (response: Response) => {
  return isApiResponse(response, "POST", "cash-balances");
};

const getResponseBody = async (response: Response) => {
  try {
    return await response.json() as CashBalanceResponseBody;
  } catch {
    return {} as CashBalanceResponseBody;
  }
};

const isModuleAuthorizationErrorBody = (body: CashBalanceResponseBody) => {
  const text = [
    body.message,
    body.error?.message,
    body.error?.name,
  ].filter(Boolean).join(" ");

  return /ModuleNotAuthorizedError|no tiene permiso|m[oó]dulo|autoriz/i.test(text);
};

test.describe("cash balance authorization", () => {
  test(
    "denies cash-balance creation when the module is disabled",
    { tag: ["@modules-disabled", "@cash-balances", "@authorization"] },
    async ({ page }) => {
      const timestamp = Date.now();
      const comment = `E2E denied cash balance ${timestamp}`;

      await loginAsE2EUser(page, { accountName: E2E_ACCOUNTS.modulesDisabled });
      await expect(page.getByText(E2E_ACCOUNTS.modulesDisabled)).toBeVisible();

      await openCashBalanceModal(page);
      await page.getByTestId("cash-balance-select-all-payment-methods").click();
      await expect(page.locator('input[value="Todos"]')).toBeVisible();
      await page.getByTestId("cash-balance-initial-amount-field").locator("input").fill("1000");
      await page.getByTestId("cash-balance-comments-field").fill(comment);

      const confirmButton = page.getByTestId("cash-balance-open-confirm");
      await expect(confirmButton).toBeEnabled();

      const [createResponse] = await Promise.all([
        page.waitForResponse(isCreateCashBalanceResponse),
        confirmButton.click(),
      ]);
      const body = await getResponseBody(createResponse);
      const isAuthorizationHttpError =
        [403, 405].includes(createResponse.status()) && isModuleAuthorizationErrorBody(body);
      const isLegacyAuthorizationError =
        createResponse.status() === 200 && body.error?.name === "ModuleNotAuthorizedError";

      expect(createResponse.status()).not.toBe(500);
      expect(isAuthorizationHttpError || isLegacyAuthorizationError, JSON.stringify(body)).toBe(true);
      expect(body.statusOk).not.toBe(true);
      expect(body.cashBalance?.id).toBeFalsy();
      await expect(page).not.toHaveURL(/\/cajas\/[^/?]+$/);
      await expect(page.getByText(/caja creada correctamente/i)).toHaveCount(0);
      await expect(page.getByText(/no tiene permiso|m[oó]dulo.*no.*habilitado|no autorizado|autorizaci[oó]n/i)).toBeVisible();
      await expect(page.getByTestId("table-row").filter({ hasText: comment })).toHaveCount(0);
    },
  );
});
