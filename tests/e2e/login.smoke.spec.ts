import { expect, test } from "@playwright/test";

test.describe("login smoke", () => {
  test("loads the login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("img", { name: /callixto.*logo/i })).toBeVisible();
    await expect(page.getByText(/ingresa a tu cuenta/i)).toBeVisible();
    await expect(page.getByPlaceholder(/correo/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /ingresar/i })).toBeVisible();
  });
});
