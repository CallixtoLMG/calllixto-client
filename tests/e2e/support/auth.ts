import { expect, type Locator, type Page, type Request } from "@playwright/test";
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

const isLoginAuthRequest = (request: Request) => {
  const url = request.url();

  return request.method() === "POST"
    && (/cognito-idp/i.test(url) || /amazonaws\.com/i.test(url));
};

type LoginFormControls = {
  form: Locator;
  emailInput: Locator;
  passwordInput: Locator;
  submitButton: Locator;
};

export const openLoginPage = async (page: Page): Promise<LoginFormControls> => {
  const response = await page.goto("/login", { waitUntil: "domcontentloaded" });
  expect(response?.status(), "Expected /login to render without a server error").toBeLessThan(500);
  await expect(page).toHaveURL(/\/login(?:\?|$)/);

  const emailInput = page.getByPlaceholder(/correo/i);
  const form = page.locator("form", { has: emailInput });
  const passwordInput = form.getByPlaceholder(/contrase/i);
  const submitButton = form.getByRole("button", { name: /ingresar/i });

  await expect(form).toBeVisible({ timeout: 30_000 });
  await expect(emailInput).toBeVisible({ timeout: 30_000 });
  await expect(passwordInput).toBeVisible({ timeout: 30_000 });
  await expect(submitButton).toHaveCount(1);
  await expect(submitButton).toBeVisible({ timeout: 30_000 });
  await expect(submitButton).toBeEnabled({ timeout: 30_000 });

  return { form, emailInput, passwordInput, submitButton };
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

  const { emailInput, passwordInput, submitButton } = await openLoginPage(page);

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await expect(submitButton).toBeEnabled();

  await Promise.all([
    page.waitForURL(/\/ventas(?:\?|$)/, { timeout: 60_000 }),
    page.waitForRequest(isLoginAuthRequest, { timeout: 30_000 }),
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
