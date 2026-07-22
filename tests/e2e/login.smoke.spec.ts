import { expect, test } from "@playwright/test";

test.describe("login smoke", () => {
  test("loads the login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("img", { name: /callixto.*logo/i })).toBeVisible();
    await expect(page.getByText(/ingresa a tu cuenta/i)).toBeVisible();
    await expect(page.getByPlaceholder(/correo/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /ingresar/i })).toBeVisible();
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

    await page.goto("/login");
    await page.getByText(/olvidaste/i).click();

    await expect(page).toHaveURL(/\/recuperar-contrasena(?:\?|$)/);
    await expect(page.getByText(/recuperar contrase/i)).toBeVisible();

    await page.getByPlaceholder(/correo/i).fill("reset.e2e@example.com");
    await page.getByRole("button", { name: /enviar/i }).click();

    await expect
      .poll(() => (recoverRequest as { username?: string } | undefined)?.username)
      .toBe("reset.e2e@example.com");
    await expect(page.getByPlaceholder(/c.digo de recuperaci.n/i)).toBeVisible();
    expect(pageErrors.join("\n")).not.toContain("useUserContext must be used within a UserProvider");
  });
});
