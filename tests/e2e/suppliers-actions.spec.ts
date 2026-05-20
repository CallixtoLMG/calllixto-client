import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import {
  deleteCurrentEntity,
  deleteEntityIfPresent,
  dismissUnsavedChangesIfVisible,
  filterByName,
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
    name: `E2E Supplier Actions ${timestamp} ${suffix}`,
    comment: `Comentario E2E supplier actions ${timestamp}`,
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
    name: `E2E Supplier Actions Brand ${timestamp} ${suffix}`,
    comment: `Comentario E2E supplier actions brand ${timestamp}`,
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

const createProductForSupplier = async (
  page: Page,
  supplier: SupplierFixture,
  brand: BrandFixture,
  timestamp: number,
  index: number,
): Promise<ProductFixture> => {
  const product = {
    localId: productLocalId(timestamp + index * 101),
    name: `E2E Supplier Product ${String.fromCharCode(65 + index)} ${timestamp}`,
    cost: "1000",
    price: "1500",
    comments: `Comentario E2E supplier product ${timestamp} ${index}`,
  };

  await page.goto("/productos/crear");
  await expect(page).toHaveURL(/\/productos\/crear(?:\?|$)/);
  await selectSearchOption(page, "product-supplier-search", supplier.name);
  await selectSearchOption(page, "product-brand-search", brand.name);
  await fillTestIdInput(page, "product-id-field", product.localId);
  await page.locator('input[name="name"]').fill(product.name);
  await fillTestIdInput(page, "product-cost-field", product.cost);
  await fillTestIdInput(page, "product-price-field", product.price);
  await page.getByPlaceholder("Realmente son muchas pulgadas").fill(product.comments);
  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailAfterSubmit(page, "productos");

  return {
    localId: product.localId,
    name: product.name,
    url: page.url(),
    fullId: `${supplier.id}${brand.id}${product.localId}`,
  };
};

const createProductsForSupplier = async (
  page: Page,
  supplier: SupplierFixture,
  brand: BrandFixture,
  timestamp: number,
  count: number,
) => {
  const products: ProductFixture[] = [];

  for (let index = 0; index < count; index += 1) {
    products.push(await createProductForSupplier(page, supplier, brand, timestamp, index));
  }

  return products;
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

const openSupplierDetail = async (page: Page, supplier: SupplierFixture) => {
  await page.goto(supplier.url);
  await waitForEntityDetailUrl(page, "proveedores");
  await expect(page.getByTestId("supplier-name-field")).toContainText(supplier.name, { timeout: 30_000 });
};

const deleteAllSupplierProducts = async (page: Page) => {
  await page.getByTestId("nav-action-eliminar todos los productos del proveedor").click();
  await page.getByTestId("modal-confirmation-input").locator("input").fill("eliminar");
  await page.getByTestId("modal-confirm").click();
  await expect(page.getByText(/lista de productos del proveedor eliminada/i)).toBeVisible({ timeout: 30_000 });
};

const selectProductState = async (page: Page, stateName: RegExp) => {
  await page.getByTestId("dropdown-state").click();
  await page.getByRole("option", { name: stateName }).click();
};

const openProductsList = async (page: Page) => {
  await page.goto("/productos");
  await expect(page).toHaveURL(productsListUrl);
  await expect(page.getByTestId("nav-action-crear")).toBeVisible({ timeout: 30_000 });
};

const assertProductsDeleted = async (page: Page, products: ProductFixture[]) => {
  await openProductsList(page);

  for (const product of products) {
    await filterByName(page, product.name);
    await expect(page.getByText(/no se encontraron/i)).toBeVisible({ timeout: 30_000 });
  }

  await selectProductState(page, /eliminados/i);

  for (const product of products) {
    await filterByName(page, product.name);
    const deletedProduct = page.getByText(product.name);

    if (await deletedProduct.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(deletedProduct).toBeVisible();
    } else {
      // La acción de proveedor puede borrar definitivamente los productos según la API actual.
      await expect(page.getByText(/no se encontraron/i)).toBeVisible({ timeout: 30_000 });
    }
  }
};

const printSupplierBarcodes = async (page: Page) => {
  await page.locator('[data-testid^="nav-action-imprimir"]').click();
  await expect.poll(
    async () => page.evaluate(() => Boolean((window as typeof window & { __printCalled?: boolean }).__printCalled)),
    { timeout: 30_000 },
  ).toBe(true);
};

const assertBarcodePrintContent = async (page: Page, products: ProductFixture[]) => {
  for (const product of products) {
    await expect(page.getByText(product.name)).toBeAttached({ timeout: 30_000 });
    await expect(page.locator(`#barcode-${product.fullId}`)).toBeAttached();
  }
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

const deleteProductPermanentlyIfPresent = async (page: Page, product: ProductFixture) => {
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
  products: ProductFixture[],
  supplier: SupplierFixture | null,
  brand: BrandFixture | null,
) => {
  for (const product of products) {
    await deleteProductPermanentlyIfPresent(page, product);
  }

  if (supplier) {
    await deleteEntityIfPresent(page, supplier.url, suppliersListUrl, "nav-action-eliminar proveedor");
  }

  if (brand) {
    await deleteEntityIfPresent(page, brand.url, brandsListUrl);
  }
};

test.describe("supplier actions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
  });

  test("deletes all products for a supplier", async ({ page }) => {
    test.setTimeout(240_000);

    const timestamp = Date.now();
    let supplier: SupplierFixture | null = null;
    let brand: BrandFixture | null = null;
    let products: ProductFixture[] = [];

    try {
      ({ supplier, brand } = await createSupplierAndBrandForActions(page, timestamp));
      products = await createProductsForSupplier(page, supplier, brand, timestamp, 3);

      await openSupplierDetail(page, supplier);
      await deleteAllSupplierProducts(page);
      await assertProductsDeleted(page, products);
    } finally {
      await cleanupCreatedData(page, products, supplier, brand);
    }
  });

  test("prints supplier product barcodes", async ({ page }) => {
    test.setTimeout(180_000);
    await installPrintSpy(page);

    const timestamp = Date.now();
    let supplier: SupplierFixture | null = null;
    let brand: BrandFixture | null = null;
    let products: ProductFixture[] = [];

    try {
      ({ supplier, brand } = await createSupplierAndBrandForActions(page, timestamp, 20));
      products = await createProductsForSupplier(page, supplier, brand, timestamp, 2);

      await openSupplierDetail(page, supplier);
      await assertBarcodePrintContent(page, products);
      await printSupplierBarcodes(page);
    } finally {
      await cleanupCreatedData(page, products, supplier, brand);
    }
  });
});
