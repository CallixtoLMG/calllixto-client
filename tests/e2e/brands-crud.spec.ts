import { expect, test, type Page } from "@playwright/test";
import {
  expectSuccessfulApiResponse,
  getE2EAccountApiUrl,
  getE2EApiHeaders,
  isApiResponse,
} from "./support/api";
import { loginAsE2EUser } from "./support/auth";
import { E2E_ACCOUNTS } from "./support/env";
import {
  deleteCurrentEntity,
  deleteEntityIfPresent,
  expectEntityDeletedFromActiveList,
  filterByName,
  selectInactiveFilter,
  waitForEntityDetailUrl,
} from "./support/entities";

const listUrl = /\/marcas(?:\?|$)/;

const twoDigitId = (seed: number) => (seed % 1296).toString(36).padStart(2, "0").toUpperCase();
const twoDigitIdWithAttempt = (seed: number, attempt: number) => twoDigitId(seed + attempt * 97);

const isBrandIdAvailable = async (page: Page, id: string) => {
  const response = await page.request.get(getE2EAccountApiUrl(`brands/${id}`), {
    headers: await getE2EApiHeaders(page),
  });

  if (response.status() === 404) return true;
  if (!response.ok()) return false;

  const body = await response.json().catch(() => ({}));
  return !body.brand;
};

const openBrandsList = async (page: Page) => {
  await page.goto("/marcas");
  await expect(page).toHaveURL(listUrl);
  await expect(page.getByTestId("nav-action-crear")).toBeVisible();
};

const createBrand = async (page: Page, timestamp: number) => {
  const brand = {
    id: twoDigitId(timestamp),
    name: `E2E Brand Test ${timestamp}`,
    comment: `Comentario E2E brand ${timestamp}`,
  };

  await openBrandsList(page);
  await page.goto("/marcas/crear");
  await expect(page).toHaveURL(/\/marcas\/crear(?:\?|$)/);

  await page.locator('input[name="name"]').fill(brand.name);
  await page.getByPlaceholder("Una marca macanuda").fill(brand.comment);

  const createButton = page.locator("form").getByRole("button", { name: /crear/i });
  let selectedId: string | null = null;

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const candidateId = twoDigitIdWithAttempt(timestamp, attempt);
    if (!(await isBrandIdAvailable(page, candidateId))) continue;

    await page.locator('input[name="id"]').fill(candidateId);

    if (await createButton.isEnabled()) {
      selectedId = candidateId;
      break;
    }
  }

  expect(selectedId, "Expected an available brand id for the E2E account").toBeTruthy();
  brand.id = selectedId as string;

  const createResponsePromise = page.waitForResponse((response) => isApiResponse(response, "POST", "brands"));
  await createButton.click();
  const createBody = await expectSuccessfulApiResponse(await createResponsePromise, {
    responseEntity: "brand",
    expectedId: brand.id,
  });
  await waitForEntityDetailUrl(page, "marcas");
  await expect(page).toHaveURL(new RegExp(`/marcas/${createBody.brand.id}(?:\\?|$)`));

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
    await loginAsE2EUser(page, { accountName: E2E_ACCOUNTS.modulesEnabled });
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
