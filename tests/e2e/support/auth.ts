import { expect, type Page } from "@playwright/test";
import { getE2ECredentials } from "./env";

export const loginAsE2EUser = async (page: Page) => {
  const { email, password } = getE2ECredentials();

  await page.goto("/login");
  await page.getByPlaceholder(/correo/i).fill(email);
  await page.getByPlaceholder(/contrase/i).fill(password);

  await Promise.all([
    page.waitForURL(/\/ventas(?:\?|$)/, { timeout: 60_000 }),
    page.getByRole("button", { name: /ingresar/i }).click(),
  ]);

  await expect(page.getByText("CallixtoGLM")).toBeVisible();
  await expect(page.getByRole("button", { name: /men/i })).toBeVisible();

  const closeUpdatesButton = page.getByRole("button", { name: /cerrar/i });
  if (await closeUpdatesButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await closeUpdatesButton.click();
  }
};
