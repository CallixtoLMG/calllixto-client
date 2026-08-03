import { expect, test, type Page } from "@playwright/test";
import * as XLSX from "xlsx";
import { loginAsE2EUser } from "./support/auth";
import { E2E_ACCOUNTS, getE2EApiBaseUrl } from "./support/env";

type ExportScenario = {
  name: string;
  path: string;
  expectedFileName: RegExp;
  accountName?: string;
  prepare?: (page: Page, timestamp: number) => Promise<string>;
  filter?: (page: Page, value: string) => Promise<void>;
  tags?: string[];
};

const twoDigitId = (seed: number) => (seed % 1296).toString(36).padStart(2, "0").toUpperCase();
const twoDigitIdWithAttempt = (seed: number, attempt: number) => twoDigitId(seed + attempt * 97);
const productLocalId = (seed: number) => (seed % 1_679_616).toString(36).padStart(4, "0").toUpperCase();

const exportScenarios: ExportScenario[] = [
  { name: "customers", path: "/clientes", expectedFileName: /lista de clientes\.xlsx$/i },
  {
    name: "suppliers",
    path: "/proveedores",
    expectedFileName: /lista de proveedores\.xlsx$/i,
    prepare: async (page, timestamp) => (await createSupplierByApi(page, timestamp)).name,
    filter: (page, value) => filterByName(page, value),
  },
  {
    name: "brands",
    path: "/marcas",
    expectedFileName: /lista de marcas\.xlsx$/i,
    prepare: async (page, timestamp) => (await createBrandByApi(page, timestamp)).name,
    filter: (page, value) => filterByName(page, value),
  },
  {
    name: "products",
    path: "/productos",
    expectedFileName: /lista de productos\.xlsx$/i,
    prepare: async (page, timestamp) => (await createProductByApi(page, timestamp)).name,
    filter: (page, value) => filterByName(page, value),
  },
  { name: "expenses", path: "/gastos", expectedFileName: /lista de gastos\.xlsx$/i },
  {
    name: "budgets",
    path: "/ventas",
    expectedFileName: /lista de ventas\.xlsx$/i,
    prepare: async (page, timestamp) => (await createBudgetByApi(page, timestamp)).customerName,
    filter: (page, value) => filterBudgetByCustomer(page, value),
  },
  {
    name: "cash balances",
    path: "/cajas",
    expectedFileName: /lista de cajas\.xlsx$/i,
    accountName: E2E_ACCOUNTS.modulesEnabled,
    tags: ["@modules-enabled", "@cash-balances"],
  },
];

const openListPage = async (page: Page, path: string) => {
  await page.goto(path);
  await expect(page).toHaveURL(new RegExp(`${path}(?:\\?|$)`));
  await expect(page.getByRole("button", { name: /descargar excel/i }).last()).toBeVisible({ timeout: 30_000 });
};

const getVisibleTableRowsCount = async (page: Page) => {
  const rows = page.getByTestId("table-row");
  const count = await rows.count();
  let visibleRows = 0;

  for (let index = 0; index < count; index += 1) {
    if (await rows.nth(index).isVisible()) {
      visibleRows += 1;
    }
  }

  return visibleRows;
};

const getExpectedExportRowsCount = async (page: Page) => {
  const paginationSummary = page.getByText(/\d+\s*-\s*\d+\s*de\s*\d+/).first();

  if (await paginationSummary.isVisible({ timeout: 2_000 })) {
    const text = (await paginationSummary.textContent()) ?? "";
    const total = text.match(/de\s*(\d+)/i)?.[1];

    if (total) return Number(total);
  }

  return getVisibleTableRowsCount(page);
};

const downloadExcel = async (page: Page) => {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /descargar excel/i }).last().click();

  return downloadPromise;
};

const getCookieValue = async (page: Page, name: string) =>
  (await page.context().cookies()).find((cookie) => cookie.name === name)?.value;

const getApiHeaders = async (page: Page) => {
  const token = await getCookieValue(page, "token");
  expect(token, "E2E login should provide an auth token").toBeTruthy();

  return { authorization: `Bearer ${token}` };
};

const getAccountApiUrl = (path: string) => {
  const accountBaseUrl = `${getE2EApiBaseUrl().replace(/\/+$/g, "")}/${E2E_ACCOUNTS.modulesEnabled}/`;
  return new URL(path.replace(/^\/+/g, ""), accountBaseUrl).toString();
};

const postApi = async <TBody extends Record<string, unknown>>(
  page: Page,
  path: string,
  payload: Record<string, unknown>,
  responseEntity: string,
) => {
  const response = await page.request.post(getAccountApiUrl(path), {
    data: payload,
    headers: await getApiHeaders(page),
  });

  expect(response.status()).toBeLessThan(500);
  expect(response.ok()).toBeTruthy();

  const body = await response.json() as TBody & { statusOk?: boolean };
  expect(body.statusOk, JSON.stringify(body)).toBe(true);
  expect(body[responseEntity], JSON.stringify(body)).toBeTruthy();

  return body;
};

const createCustomerByApi = async (page: Page, timestamp: number) => {
  const customer = {
    name: `E2E Export Customer ${timestamp}`,
    phoneNumbers: [{ ref: "Casa", areaCode: "385", number: "5555555" }],
    addresses: [{ ref: "Casa", address: "Calle E2E Export 123" }],
    emails: [],
    comments: `Comentario E2E export customer ${timestamp}`,
  };

  const body = await postApi<{ customer: typeof customer & { id?: string } }>(page, "customers", customer, "customer");
  return body.customer;
};

const createSupplierByApi = async (page: Page, timestamp: number, prefix = "E2E Export Supplier") => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const supplier = {
      id: twoDigitIdWithAttempt(timestamp, attempt + 1),
      name: `${prefix} ${timestamp} ${attempt}`,
      phoneNumbers: [],
      addresses: [],
      emails: [],
      comments: `Comentario E2E export supplier ${timestamp} ${attempt}`,
    };

    try {
      const body = await postApi<{ supplier: typeof supplier }>(page, "suppliers", supplier, "supplier");
      return body.supplier;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

const createBrandByApi = async (page: Page, timestamp: number, prefix = "E2E Export Brand") => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const brand = {
      id: twoDigitIdWithAttempt(timestamp + 37, attempt + 1),
      name: `${prefix} ${timestamp} ${attempt}`,
      comments: `Comentario E2E export brand ${timestamp} ${attempt}`,
    };

    try {
      const body = await postApi<{ brand: typeof brand }>(page, "brands", brand, "brand");
      return body.brand;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

const createProductByApi = async (page: Page, timestamp: number) => {
  const supplier = await createSupplierByApi(page, timestamp + 11, "E2E Export Product Supplier");
  const brand = await createBrandByApi(page, timestamp + 23, "E2E Export Product Brand");
  const localId = productLocalId(timestamp);
  const product = {
    id: `${supplier.id}${brand.id}${localId}`,
    name: `E2E Export Product ${timestamp}`,
    cost: 1000,
    price: 1500,
    comments: `Comentario E2E export product ${timestamp}`,
  };

  const body = await postApi<{ product: typeof product }>(page, "products", product, "product");
  return body.product;
};

const createBudgetByApi = async (page: Page, timestamp: number) => {
  const customer = await createCustomerByApi(page, timestamp);
  const product = await createProductByApi(page, timestamp + 31);
  const budgetProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    discount: 0,
    delivered: 0,
    stockControl: false,
  };
  const budget = {
    customer,
    products: [budgetProduct],
    comments: `E2E Export Budget ${timestamp}`,
    state: "DRAFT",
    globalDiscount: 0,
    additionalCharge: 0,
    expirationOffsetDays: 7,
    paymentMethods: ["all"],
    paymentsMade: [],
    pickUpInStore: false,
    total: product.price,
  };

  await postApi(page, "budgets", budget, "budget");
  return { customerName: customer.name };
};

const filterByName = async (page: Page, value: string) => {
  await page.locator('input[name="name"]').fill(value);
  await page.locator('input[name="name"]').press("Enter");
};

const filterBudgetByCustomer = async (page: Page, value: string) => {
  await page.locator('input[name="customer"]').fill(value);
  await page.locator('input[name="customer"]').press("Enter");
};

const expectExportableRow = async (page: Page, value: string) => {
  await expect(page.getByTestId("table-row").filter({ hasText: value })).toBeVisible({ timeout: 30_000 });
};

const readExcelRowsCount = async (filePath: string) => {
  const workbook = XLSX.readFile(filePath);
  const [firstSheetName] = workbook.SheetNames;
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, blankrows: false });

  const nonEmptyRows = rows.filter((row) =>
    Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== "")
  );

  return Math.max(nonEmptyRows.length - 1, 0);
};

test.describe("exports", () => {
  for (const scenario of exportScenarios) {
    test(`exports ${scenario.name} table to Excel`, { tag: scenario.tags }, async ({ page }) => {
      await loginAsE2EUser(page, { accountName: scenario.accountName ?? E2E_ACCOUNTS.modulesEnabled });

      const exportableRowText = scenario.prepare ? await scenario.prepare(page, Date.now()) : null;

      await openListPage(page, scenario.path);

      if (exportableRowText && scenario.filter) {
        await scenario.filter(page, exportableRowText);
        await expectExportableRow(page, exportableRowText);
      }

      const expectedRowsCount = await getExpectedExportRowsCount(page);
      expect(expectedRowsCount, `${scenario.name} should have rows to export`).toBeGreaterThan(0);

      const download = await downloadExcel(page);
      const suggestedFileName = download.suggestedFilename();
      const downloadedPath = await download.path();

      expect(suggestedFileName).toMatch(scenario.expectedFileName);
      expect(downloadedPath).toBeTruthy();

      const exportedRowsCount = await readExcelRowsCount(downloadedPath as string);

      expect(exportedRowsCount).toBeGreaterThan(0);
      expect(exportedRowsCount).toBe(expectedRowsCount);
    });
  }
});
