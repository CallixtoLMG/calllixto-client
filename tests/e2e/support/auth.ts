import { expect, type Page } from "@playwright/test";
import { getE2ECredentials } from "./env";

type LoginAsE2EUserOptions = {
  accountName?: RegExp | string;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toAccountDisplayName = (accountId: string) =>
  accountId
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getAccountNameMatcher = (accountName: RegExp | string) => {
  if (accountName instanceof RegExp) return accountName;

  const displayName = toAccountDisplayName(accountName);
  return new RegExp(`^(?:${escapeRegExp(accountName)}|${escapeRegExp(displayName)})$`, "i");
};

const selectAccount = async (page: Page, accountName: RegExp | string) => {
  await page.getByRole("button", { name: /Milton Barraza/i }).click();
  await page.getByRole("button", { name: /cambiar cuenta/i }).click();

  const accountButton = page.getByRole("button", { name: getAccountNameMatcher(accountName) });
  await expect(accountButton).toBeVisible();

  await Promise.all([
    page.waitForEvent("load"),
    accountButton.click(),
  ]);

  await expect(page.getByRole("img", { name: "CallixtoGLM" })).toBeVisible();
  await expect(page.getByRole("button", { name: /men/i })).toBeVisible();
};

export const loginAsE2EUser = async (page: Page, options: LoginAsE2EUserOptions = {}) => {
  const { email, password } = getE2ECredentials();

  await page.goto("/login");
  const submitButton = page.getByRole("button", { name: /ingresar/i });
  await expect(submitButton).toBeEnabled();

  await page.getByPlaceholder(/correo/i).fill(email);
  await page.getByPlaceholder(/contrase/i).fill(password);
  await expect(submitButton).toBeEnabled();

  await Promise.all([
    page.waitForURL(/\/ventas(?:\?|$)/, { timeout: 60_000 }),
    submitButton.click(),
  ]);

  await expect(page).not.toHaveURL(/\/login\?[^#]*username=/);

  await expect(page.getByRole("img", { name: "CallixtoGLM" })).toBeVisible();
  await expect(page.getByRole("button", { name: /men/i })).toBeVisible();

  const closeUpdatesButton = page.getByRole("button", { name: /cerrar/i });
  if (await closeUpdatesButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await closeUpdatesButton.click();
  }

  if (options.accountName) {
    await selectAccount(page, options.accountName);
  }
};
