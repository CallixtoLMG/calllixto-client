import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import { confirmOpenCashBalance } from "./support/cashBalances";
import { E2E_ACCOUNTS } from "./support/env";

const openCashBalancesList = async (page: Page) => {
  await page.goto("/cajas");
  await expect(page).toHaveURL(/\/cajas(?:\?|$)/);
  await expect(page.getByRole("columnheader", { name: /id/i })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("nav-action-abrir")).toBeVisible({ timeout: 30_000 });
};

const openCashBalanceModal = async (page: Page) => {
  await page.getByTestId("nav-action-abrir").click();
  await expect(page.getByTestId("open-cash-balance-modal")).toBeVisible();
  await expect(page.getByText(/abrir caja/i)).toBeVisible();
};

const addAllPaymentMethods = async (page: Page) => {
  await page.getByTestId("cash-balance-select-all-payment-methods").click();
  await expect(page.locator('input[value="Todos"]')).toBeVisible();
};

const fillOpenCashBalanceModal = async (page: Page, comment: string) => {
  await addAllPaymentMethods(page);
  await page.getByTestId("cash-balance-initial-amount-field").locator("input").fill("100");
  await page.getByTestId("cash-balance-comments-field").fill(comment);

  // El desglose de billetes queda fuera del primer E2E para evitar acoplarlo al popup interno
  // de billetes. El flujo principal de apertura/cierre no depende de ese detalle.
};

const closeCurrentCashBalance = async (page: Page) => {
  await page.getByTestId("nav-action-cerrar caja").click();
  await expect(page.getByText(/cerrar\s+la caja/i)).toBeVisible();
  await page.getByTestId("modal-confirm").click();
  await expect(page.getByText(/caja cerrada/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("nav-action-cerrar caja")).toBeHidden({ timeout: 30_000 });
};

test.describe("cash balance", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, { accountName: E2E_ACCOUNTS.modulesEnabled });
  });

  test(
    "opens and closes a cash balance",
    { tag: ["@modules-enabled", "@cash-balances"] },
    async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const comment = `Comentario E2E caja ${timestamp}`;

    await openCashBalancesList(page);
    await openCashBalanceModal(page);
    await fillOpenCashBalanceModal(page, comment);
    await confirmOpenCashBalance(page, comment);

    await expect(page.getByText(/todos los m.todos de pago/i)).toBeVisible({ timeout: 30_000 });

    await closeCurrentCashBalance(page);
    },
  );
});
