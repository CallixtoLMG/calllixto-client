import { expect, test, type Page } from "@playwright/test";
import { expectSuccessfulApiResponse, getE2EApiJson, isApiResponse } from "./support/api";
import { loginAsE2EUser } from "./support/auth";
import { E2E_ACCOUNTS } from "./support/env";
import {
  addAddress,
  addEmail,
  addPhone,
  deleteEntityIfPresent,
  expectEntityDeletedFromActiveList,
  filterByName,
  selectInactiveFilter,
  waitForEntityDetailAfterSubmit,
  waitForEntityDetailUrl,
} from "./support/entities";
import { clickPageAction, expectPageActionReady } from "./support/pageActions";

const listUrl = /\/proveedores(?:\?|$)/;

const twoDigitId = (seed: number) => (seed % 1296).toString(36).padStart(2, "0").toUpperCase();
const twoDigitIdWithAttempt = (seed: number, attempt: number) => twoDigitId(seed + attempt * 97);

const getAvailableSupplierId = async (page: Page, timestamp: number) => {
  const body = await getE2EApiJson<{ statusOk?: boolean; suppliers?: { id?: string }[] }>(
    page,
    "suppliers?attributes=%5B%22id%22%5D",
  );
  expect(body.statusOk, JSON.stringify(body)).toBe(true);

  const usedIds = new Set((body.suppliers ?? []).map((supplier) => supplier.id).filter(Boolean));

  for (let attempt = 0; attempt < 1296; attempt += 1) {
    const candidateId = twoDigitIdWithAttempt(timestamp, attempt);
    if (!usedIds.has(candidateId)) return candidateId;
  }

  throw new Error("No available two-character supplier id for the E2E account");
};

const openSuppliersList = async (page: Page) => {
  await page.goto("/proveedores");
  await expect(page).toHaveURL(listUrl);
  await expectPageActionReady(page, "nav-action-crear proveedor");
};

const createSupplier = async (page: Page, timestamp: number) => {
  const supplier = {
    id: await getAvailableSupplierId(page, timestamp),
    name: `E2E Supplier Test ${timestamp}`,
    comment: `Comentario E2E supplier ${timestamp}`,
    email1: `e2e.supplier.${timestamp}@test.com`,
    email2: `e2e.supplier.alt.${timestamp}@test.com`,
  };

  await openSuppliersList(page);
  await clickPageAction(page, "nav-action-crear proveedor");
  await expect(page).toHaveURL(/\/proveedores\/crear(?:\?|$)/);

  await page.locator('input[name="id"]').fill(supplier.id);
  await page.locator('input[name="name"]').fill(supplier.name);

  await addPhone(page, { ref: "Casa", areaCode: "385", number: "5555555" });
  await addPhone(page, { ref: "Trabajo", areaCode: "385", number: "4444444" });
  await addEmail(page, { ref: "Casa", email: supplier.email1 });
  await addEmail(page, { ref: "Trabajo", email: supplier.email2 });
  await addAddress(page, { ref: "Casa", address: "Calle Falsa 123" });
  await addAddress(page, { ref: "Trabajo", address: "Avenida Siempre Viva 742" });
  await page.getByPlaceholder("Siempre demora en los pedidos").fill(supplier.comment);

  const responsePromise = page.waitForResponse((response) => isApiResponse(response, "POST", "suppliers"));

  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  const body = await expectSuccessfulApiResponse(await responsePromise, {
    responseEntity: "supplier",
    expectedId: supplier.id,
  });
  await waitForEntityDetailAfterSubmit(page, "proveedores");
  await expect(page).toHaveURL(new RegExp(`/proveedores/${body.supplier.id}(?:\\?|$)`));

  return {
    ...supplier,
    url: page.url(),
  };
};

const deleteCurrentSupplier = async (page: Page) => {
  await clickPageAction(page, "nav-action-eliminar proveedor");
  await page.getByTestId("modal-confirmation-input").locator("input").fill("eliminar");
  await page.getByTestId("modal-confirm").click();
  await expect(page).toHaveURL(listUrl, { timeout: 30_000 });
};

const expectSupplierName = async (page: Page, name: string) => {
  await expect(page.getByTestId("supplier-name-field")).toContainText(name, { timeout: 30_000 });
};

test.describe("suppliers", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, { accountName: E2E_ACCOUNTS.modulesEnabled });
  });

  test("creates, updates, and deletes a supplier", async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const updatedName = `E2E Supplier Test ${timestamp} Updated`;
    let supplierUrl: string | null = null;

    try {
      const supplier = await createSupplier(page, timestamp);
      supplierUrl = supplier.url;

      await expectSupplierName(page, supplier.name);
      await expect(page.getByText("3855555555")).toBeVisible();
      await expect(page.getByText("3854444444")).toBeVisible();
      await expect(page.getByText(supplier.email1)).toBeVisible();
      await expect(page.getByText(supplier.email2)).toBeVisible();
      await expect(page.getByText("Calle Falsa 123")).toBeVisible();
      await expect(page.getByText("Avenida Siempre Viva 742")).toBeVisible();
      await expect(page.getByPlaceholder("Siempre demora en los pedidos")).toHaveValue(supplier.comment);

      await page.getByRole("button", { name: /^actualizar$/i }).click();
      await page.locator('input[name="name"]').fill(updatedName);
      await page.locator("form").getByRole("button", { name: /actualizar/i }).click();
      await expectSupplierName(page, updatedName);

      await deleteCurrentSupplier(page);
      supplierUrl = null;
      await expectEntityDeletedFromActiveList(page, updatedName);
    } finally {
      if (supplierUrl) {
        await deleteEntityIfPresent(page, supplierUrl, listUrl);
      }
    }
  });

  test("deactivates and reactivates a supplier", async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const inactiveReason = `Motivo E2E supplier ${timestamp}`;
    let supplierUrl: string | null = null;

    try {
      const supplier = await createSupplier(page, timestamp);
      supplierUrl = supplier.url;

      await clickPageAction(page, "nav-action-desactivar proveedor");
      await page.getByPlaceholder(/motivo/i).fill(inactiveReason);
      await page.getByTestId("modal-confirm").click();
      await expect(page.getByText(inactiveReason)).toBeVisible({ timeout: 30_000 });
      await expectPageActionReady(page, "nav-action-activar proveedor");

      await openSuppliersList(page);
      await selectInactiveFilter(page);
      await filterByName(page, supplier.name);
      await expect(page.getByText(supplier.name)).toBeVisible();

      await page.getByText(supplier.name).click();
      await expect(page).toHaveURL(/\/proveedores\/[^/]+(?:\?|$)/, { timeout: 30_000 });
      await clickPageAction(page, "nav-action-activar proveedor");
      await page.getByTestId("modal-confirm").click();
      await expectPageActionReady(page, "nav-action-desactivar proveedor");

      await deleteCurrentSupplier(page);
      supplierUrl = null;
    } finally {
      if (supplierUrl) {
        await deleteEntityIfPresent(page, supplierUrl, listUrl);
      }
    }
  });
});
