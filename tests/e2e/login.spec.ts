import { expect, test } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";

test("logs in with E2E credentials", async ({ page }) => {
  await loginAsE2EUser(page);

  await expect(page).toHaveURL(/\/ventas(?:\?|$)/);
  await expect(page.getByText("CallixtoGLM")).toBeVisible();
});
