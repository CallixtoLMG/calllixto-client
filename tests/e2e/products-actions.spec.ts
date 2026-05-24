import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import {
  deleteCurrentEntity,
  deleteEntityIfPresent,
  dismissUnsavedChangesIfVisible,
  waitForEntityDetailAfterSubmit,
  waitForEntityDetailUrl,
} from "./support/entities";

type SupplierFixture = {
  id: string;
  name: string;
  url: string;
};

type BrandFixture = {
  id: string;
  name: string;
  url: string;
};

type ProductFixture = {
  localId: string;
  name: string;
  comments: string;
  url: string;
  fullId: string;
};

const productsListUrl = /\/productos(?:\?|$)/;
const suppliersListUrl = /\/proveedores(?:\?|$)/;
const brandsListUrl = /\/marcas(?:\?|$)/;

const twoDigitId = (seed: number) => (seed % 1296).toString(36).padStart(2, "0").toUpperCase();
const productLocalId = (seed: number) => (seed % 1_679_616).toString(36).padStart(4, "0").toUpperCase();

const fillTestIdInput = async (page: Page, testId: string, value: string) => {
  await page.getByTestId(testId).locator("input").fill(value);
};

const selectSearchOption = async (page: Page, testId: string, text: string) => {
  const field = page.getByTestId(testId);

  await field.locator("input").fill(text);
  await page.getByText(text).first().click();
  await expect(field.locator("input")).toHaveValue(text);
};

const createSupplierForActions = async (page: Page, timestamp: number, suffix = 0): Promise<SupplierFixture> => {
  const supplier = {
    id: twoDigitId(timestamp + suffix * 97),
    name: `E2E Product Action Supplier ${timestamp} ${suffix}`,
    comment: `Comentario E2E product action supplier ${timestamp}`,
  };

  await page.goto("/proveedores/crear");
  await expect(page).toHaveURL(/\/proveedores\/crear(?:\?|$)/);
  await page.locator('input[name="id"]').fill(supplier.id);
  await page.locator('input[name="name"]').fill(supplier.name);
  await page.getByPlaceholder("Siempre demora en los pedidos").fill(supplier.comment);

  const createButton = page.locator("form").getByRole("button", { name: /crear/i });
  await expect(createButton).toBeEnabled({ timeout: 5_000 });
  await createButton.click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailAfterSubmit(page, "proveedores");

  return { ...supplier, url: page.url() };
};

const createBrandForActions = async (page: Page, timestamp: number, suffix = 0): Promise<BrandFixture> => {
  const brand = {
    id: twoDigitId(timestamp + 37 + suffix * 97),
    name: `E2E Product Action Brand ${timestamp} ${suffix}`,
    comment: `Comentario E2E product action brand ${timestamp}`,
  };

  await page.goto("/marcas/crear");
  await expect(page).toHaveURL(/\/marcas\/crear(?:\?|$)/);
  await page.locator('input[name="id"]').fill(brand.id);
  await page.locator('input[name="name"]').fill(brand.name);
  await page.getByPlaceholder("Una marca macanuda").fill(brand.comment);

  const createButton = page.locator("form").getByRole("button", { name: /crear/i });
  await expect(createButton).toBeEnabled({ timeout: 5_000 });
  await createButton.click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailAfterSubmit(page, "marcas");

  return { ...brand, url: page.url() };
};

const createSupplierAndBrandForActions = async (page: Page, timestamp: number, offset = 0) => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = offset + attempt;
    let supplier: SupplierFixture | null = null;
    let brand: BrandFixture | null = null;

    try {
      supplier = await createSupplierForActions(page, timestamp + attempt * 13, suffix);
      brand = await createBrandForActions(page, timestamp + attempt * 13, suffix);
      return { supplier, brand };
    } catch (error) {
      lastError = error;

      if (supplier) {
        await deleteEntityIfPresent(page, supplier.url, suppliersListUrl, "nav-action-eliminar proveedor");
      }

      if (brand) {
        await deleteEntityIfPresent(page, brand.url, brandsListUrl);
      }
    }
  }

  throw lastError;
};

const createProductForActions = async (
  page: Page,
  supplier: SupplierFixture,
  brand: BrandFixture,
  timestamp: number,
  name: string,
  comments: string,
): Promise<ProductFixture> => {
  const localId = productLocalId(timestamp);

  await page.goto("/productos/crear");
  await expect(page).toHaveURL(/\/productos\/crear(?:\?|$)/);
  await selectSearchOption(page, "product-supplier-search", supplier.name);
  await selectSearchOption(page, "product-brand-search", brand.name);
  await fillTestIdInput(page, "product-id-field", localId);
  await page.locator('input[name="name"]').fill(name);
  await fillTestIdInput(page, "product-cost-field", "1000");
  await fillTestIdInput(page, "product-price-field", "1500");
  await page.getByTestId("product-fraction-toggle").click();
  await page.getByTestId("product-unit-dropdown").click();
  await page.getByRole("option", { name: /metros/i }).click();
  await page.getByPlaceholder("Realmente son muchas pulgadas").fill(comments);
  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailAfterSubmit(page, "productos");

  return {
    localId,
    name,
    comments,
    url: page.url(),
    fullId: `${supplier.id}${brand.id}${localId}`,
  };
};

const openProductDetail = async (page: Page, product: ProductFixture) => {
  await page.goto(product.url);
  await waitForEntityDetailUrl(page, "productos");
  await expect(page.getByTestId("product-name-field")).toContainText(product.name, { timeout: 30_000 });
};

const installPrintSpy = async (page: Page) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "__printCalled", {
      value: false,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "print", {
      value: () => {
        try {
          (window.top as typeof window & { __printCalled?: boolean }).__printCalled = true;
        } catch {
          (window as typeof window & { __printCalled?: boolean }).__printCalled = true;
        }
      },
      writable: true,
      configurable: true,
    });
  });
};

const printProductBarcode = async (page: Page) => {
  await page.locator('[data-testid^="nav-action-imprimir"]').click();
  await expect.poll(
    async () => page.evaluate(() => Boolean((window as typeof window & { __printCalled?: boolean }).__printCalled)),
    { timeout: 30_000 },
  ).toBe(true);
};

const assertBarcodePrintFlow = async (page: Page, product: ProductFixture) => {
  await expect(page.locator("p").filter({ hasText: product.name })).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(`#barcode-${product.fullId}`)).toBeAttached();
};

const updateProductAndSave = async (
  page: Page,
  update: {
    name?: string;
    cost?: string;
    price?: string;
    comments?: string;
  },
) => {
  await page.getByRole("button", { name: /^actualizar$/i }).first().click();

  if (update.name) {
    await page.locator('input[name="name"]').fill(update.name);
  }

  if (update.cost) {
    await fillTestIdInput(page, "product-cost-field", update.cost);
  }

  if (update.price) {
    await fillTestIdInput(page, "product-price-field", update.price);
  }

  if (update.comments) {
    await page.getByPlaceholder("Realmente son muchas pulgadas").fill(update.comments);
  }

  await page.keyboard.press("Enter");
  await expect(page.getByText(/producto actualizado/i)).toBeVisible({ timeout: 30_000 });

  if (update.name) {
    await expect(page.getByTestId("product-name-field")).toContainText(update.name, { timeout: 30_000 });
  }

  if (update.comments) {
    await expect(page.getByPlaceholder("Realmente son muchas pulgadas")).toHaveValue(update.comments);
  }
};

const openProductHistoryTab = async (page: Page) => {
  await page.getByText("Historial de cambios").click();
  await expect(page.getByText(/producto creado el/i)).toBeVisible({ timeout: 30_000 });
};

const assertProductHistoryContainsChanges = async (page: Page, values: string[]) => {
  const historyList = page.getByRole("list");

  for (const value of values) {
    await expect(historyList.getByText(value, { exact: false })).toBeVisible({ timeout: 30_000 });
  }

  await expect(historyList.getByText(/nombre:/i).first()).toBeVisible();
  await expect(historyList.getByText(/costo:/i).first()).toBeVisible();
  await expect(historyList.getByText(/estado:/i).first()).toBeVisible();
};

const deactivateProduct = async (page: Page, reason: string) => {
  await page.getByTestId("nav-action-desactivar").click();
  await page.getByPlaceholder(/motivo/i).fill(reason);
  await page.getByTestId("modal-confirm").click();
  await expect(page.getByText(/producto desactivado/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("nav-action-activar")).toBeVisible({ timeout: 30_000 });
};

const deleteProductPermanentlyIfPresent = async (page: Page, product: ProductFixture | null) => {
  if (!product) return;

  try {
    await page.goto(product.url);

    const recoverButton = page.getByTestId("nav-action-recuperar");
    const deleteButton = page.getByTestId("nav-action-eliminar");

    if (!(await recoverButton.isVisible({ timeout: 5_000 }).catch(() => false))) {
      if (!(await deleteButton.isVisible({ timeout: 5_000 }).catch(() => false))) return;
      await deleteCurrentEntity(page);
      await expect(recoverButton).toBeVisible({ timeout: 30_000 });
    }

    if (await deleteButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await deleteCurrentEntity(page);
      await expect(page).toHaveURL(productsListUrl, { timeout: 30_000 });
    }
  } catch {
    // Best-effort cleanup: keep the original test failure as the useful signal.
  }
};

const cleanupCreatedData = async (
  page: Page,
  product: ProductFixture | null,
  supplier: SupplierFixture | null,
  brand: BrandFixture | null,
) => {
  await deleteProductPermanentlyIfPresent(page, product);

  if (supplier) {
    await deleteEntityIfPresent(page, supplier.url, suppliersListUrl, "nav-action-eliminar proveedor");
  }

  if (brand) {
    await deleteEntityIfPresent(page, brand.url, brandsListUrl);
  }
};

test.describe("product actions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
  });

  test("prints product barcode", async ({ page }) => {
    test.setTimeout(180_000);
    await installPrintSpy(page);

    const timestamp = Date.now();
    let supplier: SupplierFixture | null = null;
    let brand: BrandFixture | null = null;
    let product: ProductFixture | null = null;

    try {
      ({ supplier, brand } = await createSupplierAndBrandForActions(page, timestamp));
      product = await createProductForActions(
        page,
        supplier,
        brand,
        timestamp,
        `E2E Product Barcode ${timestamp}`,
        `Comentario E2E barcode ${timestamp}`,
      );

      await openProductDetail(page, product);
      await assertBarcodePrintFlow(page, product);
      await printProductBarcode(page);
    } finally {
      await cleanupCreatedData(page, product, supplier, brand);
    }
  });

  test("shows product change history after updates", async ({ page }) => {
    test.setTimeout(240_000);

    const timestamp = Date.now();
    const initialName = `E2E Product History ${timestamp}`;
    const updatedName = `E2E Product History ${timestamp} Updated A`;
    const inactiveReason = `Motivo E2E historial producto ${timestamp}`;
    let supplier: SupplierFixture | null = null;
    let brand: BrandFixture | null = null;
    let product: ProductFixture | null = null;

    try {
      ({ supplier, brand } = await createSupplierAndBrandForActions(page, timestamp, 20));
      product = await createProductForActions(
        page,
        supplier,
        brand,
        timestamp,
        initialName,
        `Comentario E2E historial ${timestamp}`,
      );

      await openProductDetail(page, product);
      await updateProductAndSave(page, { name: updatedName });
      product.name = updatedName;

      await updateProductAndSave(page, { cost: "1200" });
      await deactivateProduct(page, inactiveReason);

      await page.reload();
      await openProductHistoryTab(page);
      await assertProductHistoryContainsChanges(page, [updatedName, inactiveReason]);
    } finally {
      await cleanupCreatedData(page, product, supplier, brand);
    }
  });
});
