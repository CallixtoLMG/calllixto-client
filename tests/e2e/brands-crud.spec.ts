import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import {
  deleteCurrentEntity,
  deleteEntityIfPresent,
  expectEntityDeletedFromActiveList,
  filterByName,
  selectInactiveFilter,
  waitForEntityDetailUrl,
} from "./support/entities";

const listUrl = /\/marcas(?:\?|$)/;

const twoDigitId = () => Math.floor(Math.random() * 1296).toString(36).padStart(2, "0").toUpperCase();

const openBrandsList = async (page: Page) => {
  await page.goto("/marcas");
  await expect(page).toHaveURL(listUrl);
  await expect(page.getByTestId("nav-action-crear")).toBeVisible();
};

const createBrand = async (page: Page, timestamp: number) => {
  const brand = {
    id: twoDigitId(),
    name: `E2E Brand Test ${timestamp}`,
    comment: `Comentario E2E brand ${timestamp}`,
  };

  await openBrandsList(page);
  await page.goto("/marcas/crear");
  await expect(page).toHaveURL(/\/marcas\/crear(?:\?|$)/);

  await page.locator('input[name="id"]').fill(brand.id);
  await page.locator('input[name="name"]').fill(brand.name);
  await page.getByPlaceholder("Una marca macanuda").fill(brand.comment);

  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await waitForEntityDetailUrl(page, "marcas");

  return {
    ...brand,
    url: page.url(),
  };
};

const deleteCurrentBrand = async (page: Page) => {
  await deleteCurrentEntity(page);
  await expect(page).toHaveURL(listUrl, { timeout: 30_000 });
};

const expectBrandName = async (page: Page, name: string) => {
  await expect(page.getByTestId("brand-name-field")).toContainText(name, { timeout: 30_000 });
};

test.describe("brands", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
  });

  test("creates, updates, and deletes a brand", async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const updatedName = `E2E Brand Test ${timestamp} Updated`;
    let brandUrl: string | null = null;

    try {
      const brand = await createBrand(page, timestamp);
      brandUrl = brand.url;

      await expectBrandName(page, brand.name);
      await expect(page.getByPlaceholder("Una marca macanuda")).toHaveValue(brand.comment);

      await page.getByRole("button", { name: /^actualizar$/i }).click();
      await page.locator('input[name="name"]').fill(updatedName);
      await page.locator("form").getByRole("button", { name: /actualizar/i }).click();
      await expectBrandName(page, updatedName);

      await deleteCurrentBrand(page);
      brandUrl = null;
      await expectEntityDeletedFromActiveList(page, updatedName);
    } finally {
      if (brandUrl) {
        await deleteEntityIfPresent(page, brandUrl, listUrl);
      }
    }
  });

  test("deactivates and reactivates a brand", async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const inactiveReason = `Motivo E2E brand ${timestamp}`;
    let brandUrl: string | null = null;

    try {
      const brand = await createBrand(page, timestamp);
      brandUrl = brand.url;

      await page.getByTestId("nav-action-desactivar").click();
      await page.getByPlaceholder(/motivo/i).fill(inactiveReason);
      await page.getByTestId("modal-confirm").click();
      await expect(page.getByText(inactiveReason)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("nav-action-activar")).toBeVisible();

      await openBrandsList(page);
      await selectInactiveFilter(page);
      await filterByName(page, brand.name);
      await expect(page.getByText(brand.name)).toBeVisible();

      await page.getByText(brand.name).click();
      await expect(page).toHaveURL(/\/marcas\/[^/]+(?:\?|$)/, { timeout: 30_000 });
      await page.getByTestId("nav-action-activar").click();
      await page.getByTestId("modal-confirm").click();
      await expect(page.getByTestId("nav-action-desactivar")).toBeVisible({ timeout: 30_000 });

      await deleteCurrentBrand(page);
      brandUrl = null;
    } finally {
      if (brandUrl) {
        await deleteEntityIfPresent(page, brandUrl, listUrl);
      }
    }
  });
});
