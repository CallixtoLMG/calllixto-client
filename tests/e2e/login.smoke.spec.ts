import { expect, test } from "@playwright/test";
import { openLoginPage } from "./support/auth";

test.describe("login smoke", () => {
  test("loads the login page", async ({ page }) => {
    const { emailInput, submitButton } = await openLoginPage(page);

    await expect(page.getByRole("img", { name: "Callixto" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /iniciar sesi/i })).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("opens password recovery from login and requests a reset code", async ({ page }) => {
    const pageErrors: string[] = [];
    let recoverRequest: unknown;

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.route("**/users/restore", async (route) => {
      recoverRequest = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ statusOk: true }),
      });
    });

    await openLoginPage(page);
    await page.getByText(/olvidaste/i).click();

    await expect(page).toHaveURL(/\/recuperar-contrasena(?:\?|$)/);
    await expect(page.getByRole("heading", { name: /recuperar contrase/i })).toBeVisible();

    await page.getByPlaceholder(/correo/i).fill("reset.e2e@example.com");
    await page.getByRole("button", { name: /enviar/i }).click();

    await expect
      .poll(() => (recoverRequest as { username?: string } | undefined)?.username)
      .toBe("reset.e2e@example.com");
    await expect(page.getByPlaceholder(/c.digo de recuperaci.n/i)).toBeVisible();
    expect(pageErrors.join("\n")).not.toContain("useUserContext must be used within a UserProvider");
  });
});
