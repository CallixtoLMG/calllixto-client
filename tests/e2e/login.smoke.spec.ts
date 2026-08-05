import { expect, test } from "@playwright/test";

const encodeCookieJson = (value: unknown) =>
  Buffer.from(JSON.stringify(value), "utf8").toString("base64");

const addAuthenticatedSession = async (context) => {
  await context.addCookies([
    {
      name: "token",
      value: "e2e-token",
      url: "http://127.0.0.1:3000",
    },
    {
      name: "userData",
      value: encodeCookieJson({
        isAuthorized: true,
        name: "E2E User",
        username: "e2e.user@example.com",
        roles: ["user"],
        accountId: "e2e-account",
      }),
      url: "http://127.0.0.1:3000",
    },
  ]);
};

const passwordMatchIcon = (page) =>
  page.getByText("Las contraseñas coinciden.").locator("xpath=preceding-sibling::p[1]/i");

test.describe("login smoke", () => {
  test("loads the login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("img", { name: /callixto.*logo/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /iniciar sesi.n/i })).toBeVisible();
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
    await expect(page.getByRole("heading", { name: /recuperar contrase/i })).toBeVisible();

    await page.getByPlaceholder(/correo/i).fill("reset.e2e@example.com");
    await page.getByRole("button", { name: /enviar/i }).click();

    await expect
      .poll(() => (recoverRequest as { username?: string } | undefined)?.username)
      .toBe("reset.e2e@example.com");
    await expect(page.getByPlaceholder(/c.digo de recuperaci.n/i)).toBeVisible();
    await expect(page.getByText("Las contraseñas coinciden.")).toBeVisible();

    const matchIcon = passwordMatchIcon(page);
    await expect(matchIcon).toHaveClass(/red/);
    await page.getByPlaceholder(/^nueva contrase/i).fill("ValidPass1!");
    await page.getByPlaceholder(/confirmar nueva contrase/i).fill("OtherPass1!");
    await expect(matchIcon).toHaveClass(/red/);
    await page.getByPlaceholder(/confirmar nueva contrase/i).fill("ValidPass1!");
    await expect(matchIcon).toHaveClass(/green/);
    expect(pageErrors.join("\n")).not.toContain("useUserContext must be used within a UserProvider");
  });

  test("keeps password recovery public without authenticated header", async ({ page }) => {
    await page.goto("/recuperar-contrasena");

    await expect(page.getByRole("img", { name: /callixto.*logo/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /recuperar contrase/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /men/i })).toHaveCount(0);
    await expect(page.getByText("CallixtoGLM")).toHaveCount(0);
  });

  test("redirects unauthenticated change password requests to login", async ({ page }) => {
    await page.goto("/cambiar-contrasena");

    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(page.getByRole("heading", { name: /iniciar sesi.n/i })).toBeVisible();
  });

  test("renders change password under authenticated layout with header and match criterion", async ({ page, context }) => {
    await addAuthenticatedSession(context);
    await page.route("**/users/restore", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ statusOk: true }),
      });
    });

    await page.goto("/cambiar-contrasena");

    await expect(page).toHaveURL(/\/cambiar-contrasena(?:\?|$)/);
    await expect(page.getByRole("button", { name: /men/i })).toBeVisible();
    const closeUpdatesButton = page.getByRole("button", { name: /cerrar/i });
    if (await closeUpdatesButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await closeUpdatesButton.click();
    }
    await expect(page.getByRole("img", { name: /callixto.*logo/i })).toHaveCount(0);
    await expect(page.locator(".ui.breadcrumb")).toContainText("Cambiar contraseña");
    await expect(page.locator("section h1")).toHaveCount(0);
    await expect(page.getByText("Te enviaremos por correo un enlace con el código necesario para cambiar tu contraseña.")).toBeVisible();
    await expect(page.getByText(/Al solicitar el c.digo, recibir.s un enlace/i)).toHaveCount(0);
    const cardText = await page.locator("section").innerText();
    expect(cardText.indexOf("Solicitar código de validación")).toBeLessThan(
      cardText.indexOf("Te enviaremos por correo")
    );
    await expect(page.getByText("Las contraseñas coinciden.")).toBeVisible();

    const matchIcon = passwordMatchIcon(page);
    await expect(matchIcon).toHaveClass(/red/);
    await page.getByRole("button", { name: /solicitar c.digo de validaci.n/i }).click();
    await page.getByPlaceholder(/^nueva contrase/i).fill("ValidPass1!");
    await page.getByPlaceholder(/confirmar contrase/i).fill("OtherPass1!");
    await expect(matchIcon).toHaveClass(/red/);
    await page.getByPlaceholder(/confirmar contrase/i).fill("ValidPass1!");
    await expect(matchIcon).toHaveClass(/green/);
  });
});
