import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import {
  deleteEntityIfPresent,
  dismissUnsavedChangesIfVisible,
  expectEntityDeletedFromActiveList,
  filterByName,
  selectInactiveFilter,
  waitForEntityDetailAfterSubmit,
  waitForEntityDetailUrl,
} from "./support/entities";

type ProductFixture = {
  localId: string;
  name: string;
  cost: string;
  price: string;
  comments: string;
  tagsCount?: number;
};

type ProductDependencies = {
  supplier: { id: string; name: string; url: string };
  brand: { id: string; name: string; url: string };
};

const productsListUrl = /\/productos(?:\?|$)/;
const suppliersListUrl = /\/proveedores(?:\?|$)/;
const brandsListUrl = /\/marcas(?:\?|$)/;

const twoDigitId = (seed: number) => (seed % 1296).toString(36).padStart(2, "0").toUpperCase();
const twoDigitIdWithAttempt = (seed: number, attempt: number) => twoDigitId(seed + attempt * 97);
const productLocalId = (seed: number) => (seed % 1_679_616).toString(36).padStart(4, "0").toUpperCase();

const fillTestIdInput = async (page: Page, testId: string, value: string) => {
  await page.getByTestId(testId).locator("input").fill(value);
};

const openProductsList = async (page: Page) => {
  await page.goto("/productos");
  await expect(page).toHaveURL(productsListUrl);
  await expect(page.getByTestId("nav-action-crear")).toBeVisible();
};

const createSupplier = async (page: Page, timestamp: number, attempt = 0) => {
  const supplier = {
    id: twoDigitIdWithAttempt(timestamp, attempt),
    name: `E2E Product Supplier ${timestamp}`,
    comment: `Comentario E2E product supplier ${timestamp}`,
  };

  await page.goto("/proveedores");
  await expect(page).toHaveURL(suppliersListUrl);
  await page.getByTestId("nav-action-crear").click();
  await expect(page).toHaveURL(/\/proveedores\/crear(?:\?|$)/);

  await page.locator('input[name="id"]').fill(supplier.id);
  await page.locator('input[name="name"]').fill(supplier.name);
  await page.getByPlaceholder("Siempre demora en los pedidos").fill(supplier.comment);
  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailAfterSubmit(page, "proveedores");

  return { ...supplier, url: page.url() };
};

const createBrand = async (page: Page, timestamp: number, attempt = 0) => {
  const brand = {
    id: twoDigitIdWithAttempt(timestamp + 37, attempt),
    name: `E2E Product Brand ${timestamp}`,
    comment: `Comentario E2E product brand ${timestamp}`,
  };

  await page.goto("/marcas");
  await expect(page).toHaveURL(brandsListUrl);
  await page.getByTestId("nav-action-crear").click();
  await expect(page).toHaveURL(/\/marcas\/crear(?:\?|$)/);

  await page.locator('input[name="id"]').fill(brand.id);
  await page.locator('input[name="name"]').fill(brand.name);
  await page.getByPlaceholder("Una marca macanuda").fill(brand.comment);
  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailAfterSubmit(page, "marcas");

  return { ...brand, url: page.url() };
};

const cleanupDependencies = async (page: Page, dependencies: ProductDependencies | null) => {
  if (!dependencies) return;

  await deleteEntityIfPresent(page, dependencies.brand.url, brandsListUrl);
  await deleteEntityIfPresent(page, dependencies.supplier.url, suppliersListUrl, "nav-action-eliminar proveedor");
};

const cleanupPartialDependencies = async (
  page: Page,
  supplier: ProductDependencies["supplier"] | null,
  brand: ProductDependencies["brand"] | null,
) => {
  if (brand) {
    await deleteEntityIfPresent(page, brand.url, brandsListUrl);
  }

  if (supplier) {
    await deleteEntityIfPresent(page, supplier.url, suppliersListUrl, "nav-action-eliminar proveedor");
  }
};

const createDependencies = async (page: Page, timestamp: number): Promise<ProductDependencies> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const attemptTimestamp = timestamp + attempt;
    let supplier: ProductDependencies["supplier"] | null = null;
    let brand: ProductDependencies["brand"] | null = null;

    try {
      supplier = await createSupplier(page, attemptTimestamp, attempt);
      brand = await createBrand(page, attemptTimestamp, attempt);
      return { supplier, brand };
    } catch (error) {
      lastError = error;
      await cleanupPartialDependencies(page, supplier, brand);
    }
  }

  throw lastError;
};

const selectSearchOption = async (page: Page, testId: string, text: string) => {
  const field = page.getByTestId(testId);

  await field.locator("input").fill(text);
  await page.getByText(text).first().click();
  await expect(field.locator("input")).toHaveValue(text);
};

const selectAvailableTags = async (page: Page, requestedCount = 2) => {
  const selectedTags: string[] = [];
  const tagsDropdown = page.getByTestId("dropdown-tags");

  if (!(await tagsDropdown.isVisible({ timeout: 5_000 }).catch(() => false))) {
    return selectedTags;
  }

  await tagsDropdown.click();

  const options = () => page
    .locator('[role="option"]')
    .filter({ visible: true })
    .filter({ hasNotText: /todos|no hay|no se encontraron/i });

  if (!(await options().count())) {
    await page.keyboard.press("Escape");
    return selectedTags;
  }

  for (let index = 0; index < requestedCount; index += 1) {
    const currentOptions = options();
    if (!(await currentOptions.count())) break;

    const option = currentOptions.nth(0);
    const text = (await option.innerText()).trim();
    selectedTags.push(text);
    await option.click();
  }

  return selectedTags;
};

const fillProductForm = async (page: Page, product: ProductFixture, dependencies: ProductDependencies) => {
  await selectSearchOption(page, "product-supplier-search", dependencies.supplier.name);
  await selectSearchOption(page, "product-brand-search", dependencies.brand.name);
  await fillTestIdInput(page, "product-id-field", product.localId);
  await page.locator('input[name="name"]').fill(product.name);

  await page.getByTestId("product-stock-control-toggle").click();
  await fillTestIdInput(page, "product-cost-field", product.cost);
  await fillTestIdInput(page, "product-price-field", product.price);

  await page.getByTestId("product-fraction-toggle").click();
  await page.getByTestId("product-unit-dropdown").click();
  await page.getByRole("option", { name: /metros/i }).click();

  const selectedTags = product.tagsCount ? await selectAvailableTags(page, product.tagsCount) : [];
  await page.getByPlaceholder("Realmente son muchas pulgadas").fill(product.comments);

  return { selectedTags };
};

const createProduct = async (page: Page, product: ProductFixture, dependencies: ProductDependencies) => {
  await openProductsList(page);
  await page.getByTestId("nav-action-crear").click();
  await expect(page).toHaveURL(/\/productos\/crear(?:\?|$)/);

  const selectedData = await fillProductForm(page, product, dependencies);

  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailAfterSubmit(page, "productos");

  return {
    url: page.url(),
    fullId: `${dependencies.supplier.id}${dependencies.brand.id}${product.localId}`,
    ...selectedData,
  };
};

const expectProductName = async (page: Page, name: string) => {
  await expect(page.getByTestId("product-name-field")).toContainText(name, { timeout: 30_000 });
};

const expectPriceField = async (page: Page, testId: string, value: string) => {
  await expect(page.getByTestId(testId).locator("input")).toHaveValue(value, { timeout: 30_000 });
};

const confirmDelete = async (page: Page) => {
  await page.getByTestId("modal-confirmation-input").locator("input").fill("eliminar");
  await page.getByTestId("modal-confirm").click();
};

const softDeleteCurrentProduct = async (page: Page) => {
  await page.getByTestId("nav-action-eliminar").click();
  await confirmDelete(page);
  await expect(page.getByTestId("nav-action-recuperar")).toBeVisible({ timeout: 30_000 });
};

const permanentlyDeleteCurrentProduct = async (page: Page) => {
  await page.getByTestId("nav-action-eliminar").click();
  await confirmDelete(page);
  await expect(page).toHaveURL(productsListUrl, { timeout: 30_000 });
};

const deleteProductPermanentlyIfPresent = async (page: Page, productUrl: string | null) => {
  if (!productUrl) return;

  try {
    await page.goto(productUrl);

    const recoverButton = page.getByTestId("nav-action-recuperar");
    const deleteButton = page.getByTestId("nav-action-eliminar");

    if (!(await recoverButton.isVisible({ timeout: 5_000 }).catch(() => false))) {
      if (!(await deleteButton.isVisible({ timeout: 5_000 }).catch(() => false))) return;
      await softDeleteCurrentProduct(page);
    }

    if (await deleteButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await permanentlyDeleteCurrentProduct(page);
    }
  } catch {
    // Best-effort cleanup: keep the original test failure as the useful signal.
  }
};

const selectProductState = async (page: Page, stateName: RegExp) => {
  await page.getByTestId("dropdown-state").click();
  await page.getByRole("option", { name: stateName }).click();
};

const selectDeletedFilter = async (page: Page) => {
  await selectProductState(page, /eliminados/i);
};

const openProductFromList = async (page: Page, productName: string) => {
  await page.getByText(productName).first().click();
  await waitForEntityDetailUrl(page, "productos");
};

const addStockMovement = async (page: Page, type: "add" | "remove", quantity: string, comment: string) => {
  await page.getByTestId(type === "add" ? "stock-add-button" : "stock-remove-button").click();
  await fillTestIdInput(page, "stock-quantity-field", quantity);
  await fillTestIdInput(page, "stock-comments-field", comment);
  await page.getByTestId("modal-confirm").click();
  await expect(page.getByText(comment)).toBeVisible({ timeout: 30_000 });
};

test.describe("products", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
  });

  test("creates and updates a product", async ({ page }) => {
    test.setTimeout(180_000);

    const timestamp = Date.now();
    const product = {
      localId: productLocalId(timestamp),
      name: `E2E Product Test ${timestamp}`,
      cost: "1000",
      price: "1500",
      comments: `Comentario E2E producto ${timestamp}`,
      tagsCount: 2,
    };
    const updatedName = `E2E Product Test ${timestamp} Updated`;
    const updatedComment = `Comentario E2E producto actualizado ${timestamp}`;
    let dependencies: ProductDependencies | null = null;
    let productUrl: string | null = null;

    try {
      dependencies = await createDependencies(page, timestamp);
      const createdProduct = await createProduct(page, product, dependencies);
      productUrl = createdProduct.url;

      await expectProductName(page, product.name);
      await expect(page.getByText(dependencies.supplier.name)).toBeVisible();
      await expect(page.getByText(dependencies.brand.name)).toBeVisible();
      await expectPriceField(page, "product-cost-field", "1,000");
      await expectPriceField(page, "product-price-field", "1,500");
      await expect(page.getByPlaceholder("Realmente son muchas pulgadas")).toHaveValue(product.comments);

      for (const tag of createdProduct.selectedTags) {
        await expect(page.getByText(tag)).toBeVisible();
      }

      await page.getByRole("button", { name: /^actualizar$/i }).click();
      await page.locator('input[name="name"]').fill(updatedName);
      await fillTestIdInput(page, "product-cost-field", "1200");
      await fillTestIdInput(page, "product-price-field", "1800");
      await page.getByPlaceholder("Realmente son muchas pulgadas").fill(updatedComment);
      await page.locator("form").getByRole("button", { name: /actualizar/i }).click();

      await expectProductName(page, updatedName);
      await expectPriceField(page, "product-cost-field", "1,200");
      await expectPriceField(page, "product-price-field", "1,800");
      await expect(page.getByPlaceholder("Realmente son muchas pulgadas")).toHaveValue(updatedComment);

      await deleteProductPermanentlyIfPresent(page, productUrl);
      productUrl = null;
    } finally {
      await deleteProductPermanentlyIfPresent(page, productUrl);
      await cleanupDependencies(page, dependencies);
    }
  });

  test("deactivates and reactivates a product", async ({ page }) => {
    test.setTimeout(180_000);

    const timestamp = Date.now();
    const productName = `E2E Product Test ${timestamp}`;
    const inactiveReason = `Motivo E2E product ${timestamp}`;
    let dependencies: ProductDependencies | null = null;
    let productUrl: string | null = null;

    try {
      dependencies = await createDependencies(page, timestamp);
      const createdProduct = await createProduct(page, {
        localId: productLocalId(timestamp),
        name: productName,
        cost: "1000",
        price: "1500",
        comments: `Comentario E2E producto ${timestamp}`,
      }, dependencies);
      productUrl = createdProduct.url;

      await page.getByTestId("nav-action-desactivar").click();
      await page.getByPlaceholder(/motivo/i).fill(inactiveReason);
      await page.getByTestId("modal-confirm").click();
      await expect(page.getByText(inactiveReason)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("nav-action-activar")).toBeVisible();

      await openProductsList(page);
      await selectInactiveFilter(page);
      await filterByName(page, productName);
      await expect(page.getByText(productName)).toBeVisible();

      await openProductFromList(page, productName);
      await page.getByTestId("nav-action-activar").click();
      await page.getByTestId("modal-confirm").click();
      await expect(page.getByTestId("nav-action-desactivar")).toBeVisible({ timeout: 30_000 });

      await deleteProductPermanentlyIfPresent(page, productUrl);
      productUrl = null;
    } finally {
      await deleteProductPermanentlyIfPresent(page, productUrl);
      await cleanupDependencies(page, dependencies);
    }
  });

  test("adds and removes stock for a stock-controlled product", async ({ page }) => {
    test.setTimeout(180_000);

    const timestamp = Date.now();
    const productName = `E2E Product Test ${timestamp}`;
    const addComment = `Ingreso stock E2E product ${timestamp}`;
    const removeComment = `Egreso stock E2E product ${timestamp}`;
    let dependencies: ProductDependencies | null = null;
    let productUrl: string | null = null;

    try {
      dependencies = await createDependencies(page, timestamp);
      const createdProduct = await createProduct(page, {
        localId: productLocalId(timestamp),
        name: productName,
        cost: "1000",
        price: "1500",
        comments: `Comentario E2E producto ${timestamp}`,
      }, dependencies);
      productUrl = createdProduct.url;

      await page.getByText("Control de stock").click();
      await expect(page.getByText(/movimientos de stock/i)).toBeVisible();

      await addStockMovement(page, "add", "10", addComment);
      await expect(page.getByText(/Stock:\s*10/i)).toBeVisible({ timeout: 30_000 });

      await addStockMovement(page, "remove", "3", removeComment);
      await expect(page.getByText(/Stock:\s*7/i)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("table-cell-quantity").getByText("3", { exact: true })).toBeVisible();

      await deleteProductPermanentlyIfPresent(page, productUrl);
      productUrl = null;
    } finally {
      await deleteProductPermanentlyIfPresent(page, productUrl);
      await cleanupDependencies(page, dependencies);
    }
  });

  test("soft deletes and permanently deletes a product", async ({ page }) => {
    test.setTimeout(180_000);

    const timestamp = Date.now();
    const productName = `E2E Product Test ${timestamp}`;
    let dependencies: ProductDependencies | null = null;
    let productUrl: string | null = null;

    try {
      dependencies = await createDependencies(page, timestamp);
      const createdProduct = await createProduct(page, {
        localId: productLocalId(timestamp),
        name: productName,
        cost: "1000",
        price: "1500",
        comments: `Comentario E2E producto ${timestamp}`,
      }, dependencies);
      productUrl = createdProduct.url;

      await softDeleteCurrentProduct(page);

      await openProductsList(page);
      await selectDeletedFilter(page);
      await filterByName(page, productName);
      await expect(page.getByText(productName)).toBeVisible();

      await openProductFromList(page, productName);
      await permanentlyDeleteCurrentProduct(page);
      productUrl = null;

      await selectDeletedFilter(page);
      await expectEntityDeletedFromActiveList(page, productName);
    } finally {
      await deleteProductPermanentlyIfPresent(page, productUrl);
      await cleanupDependencies(page, dependencies);
    }
  });
});
