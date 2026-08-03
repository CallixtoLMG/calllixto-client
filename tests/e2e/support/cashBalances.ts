import { expect, type Page, type Response } from "@playwright/test";

type CreateCashBalanceResponse = {
  statusOk?: boolean;
  message?: string;
  error?: { message?: string; name?: string; status?: number };
  cashBalance?: { id?: string };
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isCreateCashBalanceResponse = (response: Response) => {
  return response.request().method() === "POST" && new URL(response.url()).pathname.endsWith("/cash-balances");
};

export const confirmOpenCashBalance = async (page: Page, comment?: string) => {
  const [createResponse] = await Promise.all([
    page.waitForResponse(isCreateCashBalanceResponse),
    page.getByTestId("cash-balance-open-confirm").click(),
  ]);

  expect(createResponse.status()).toBeLessThan(400);

  const body = await createResponse.json() as CreateCashBalanceResponse;
  expect(body.statusOk, JSON.stringify(body)).toBe(true);

  const cashBalanceId = body.cashBalance?.id;
  expect(cashBalanceId, JSON.stringify(body)).toBeTruthy();

  await expect(page).toHaveURL(new RegExp(`/cajas/${escapeRegExp(cashBalanceId ?? "")}(?:\\?|$)`), {
    timeout: 30_000,
  });
  await expect(page.getByTestId("open-cash-balance-modal")).toBeHidden();

  if (comment) {
    await expect(page.getByTestId("textarea-comments")).toHaveValue(comment);
  }

  return { id: cashBalanceId as string, url: page.url() };
};
