import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import {
  addAddress,
  addEmail,
  addPhone,
  deleteCurrentEntity,
  deleteEntityIfPresent,
  expectEntityDeletedFromActiveList,
  filterByName,
  selectInactiveFilter,
  waitForEntityDetailAfterSubmit,
  waitForEntityDetailUrl,
} from "./support/entities";

const listUrl = /\/proveedores(?:\?|$)/;

const twoDigitId = () => Math.floor(Math.random() * 1296).toString(36).padStart(2, "0").toUpperCase();

const openSuppliersList = async (page: Page) => {
  await page.goto("/proveedores");
  await expect(page).toHaveURL(listUrl);
  await expect(page.getByTestId("nav-action-crear")).toBeVisible();
};

const createSupplier = async (page: Page, timestamp: number) => {
  const supplier = {
    id: twoDigitId(),
    name: `E2E Supplier Test ${timestamp}`,
    comment: `Comentario E2E supplier ${timestamp}`,
    email1: `e2e.supplier.${timestamp}@test.com`,
    email2: `e2e.supplier.alt.${timestamp}@test.com`,
  };

  await openSuppliersList(page);
  await page.goto("/proveedores/crear");
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

  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await waitForEntityDetailAfterSubmit(page, "proveedores");

  return {
    ...supplier,
    url: page.url(),
  };
};

const deleteCurrentSupplier = async (page: Page) => {
  await deleteCurrentEntity(page, "nav-action-eliminar proveedor");
  await expect(page).toHaveURL(listUrl, { timeout: 30_000 });
};

const expectSupplierName = async (page: Page, name: string) => {
  await expect(page.getByTestId("supplier-name-field")).toContainText(name, { timeout: 30_000 });
};

test.describe("suppliers", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
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

      await page.getByTestId("nav-action-desactivar").click();
      await page.getByPlaceholder(/motivo/i).fill(inactiveReason);
      await page.getByTestId("modal-confirm").click();
      await expect(page.getByText(inactiveReason)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("nav-action-activar")).toBeVisible();

      await openSuppliersList(page);
      await selectInactiveFilter(page);
      await filterByName(page, supplier.name);
      await expect(page.getByText(supplier.name)).toBeVisible();

      await page.getByText(supplier.name).click();
      await expect(page).toHaveURL(/\/proveedores\/[^/]+(?:\?|$)/, { timeout: 30_000 });
      await page.getByTestId("nav-action-activar").click();
      await page.getByTestId("modal-confirm").click();
      await expect(page.getByTestId("nav-action-desactivar")).toBeVisible({ timeout: 30_000 });

      await deleteCurrentSupplier(page);
      supplierUrl = null;
    } finally {
      if (supplierUrl) {
        await deleteEntityIfPresent(page, supplierUrl, listUrl);
      }
    }
  });
});
