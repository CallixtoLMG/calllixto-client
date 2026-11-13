import { expect, test, type Locator, type Page } from "@playwright/test";
import * as XLSX from "xlsx";
import { getE2EAccountApiUrl, getE2EApiHeaders } from "./support/api";
import { loginAsE2EUser } from "./support/auth";
import { confirmOpenCashBalance, openCashBalanceModal } from "./support/cashBalances";

type ExportScenario = {
  name: string;
  path: string;
  expectedFileName: RegExp;
  prepare?: (page: Page, timestamp: number) => Promise<string>;
  filter?: (page: Page, value: string) => Promise<void>;
  tags?: string[];
};

const twoDigitId = (seed: number) => (seed % 1296).toString(36).padStart(2, "0").toUpperCase();
const twoDigitIdWithAttempt = (seed: number, attempt: number) => twoDigitId(seed + attempt * 97);
const productLocalId = (seed: number) => (seed % 1_679_616).toString(36).padStart(4, "0").toUpperCase();

const exportScenarios: ExportScenario[] = [
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
  {
    name: "cash balances",
    path: "/cajas",
    expectedFileName: /lista de cajas\.xlsx$/i,
    prepare: async (page, timestamp) => (await createCashBalanceForExport(page, timestamp)).id,
    filter: (page, value) => filterById(page, value),
    tags: ["@modules-enabled", "@cash-balances"],
  },
];

const openListPage = async (page: Page, path: string) => {
  await page.goto(path);
  await expect(page).toHaveURL(new RegExp(`${path}(?:\\?|$)`));
  await expect(getPageActionsRail(page)).toBeAttached({ timeout: 30_000 });
};

const getExpectedExportRowsCount = async (page: Page) => {
  const pattern = /^[\d.]+\s*-\s*[\d.]+\s+de\s+([\d.]+)$/i;
  const summary = page.getByText(pattern);
  await expect(summary).toBeVisible();
  const total = (await summary.innerText()).trim().match(pattern)?.[1];
  expect(total).toBeDefined();
  return Number(total?.replace(/\./g, ""));
};

const getPageActionsRail = (page: Page) => page.getByTestId("page-actions-aside");
const getExcelDownloadAction = (page: Page) =>
  getPageActionsRail(page).getByTestId(/^nav-action-descargar .+ en excel$/);
const isActionReady = async (action: Locator) => {
  if (await action.count() !== 1) return false;
  return action.click({ trial: true, timeout: 1_000 }).then(() => true).catch(() => false);
};
const expectActionReady = async (action: Locator) => {
  await expect(action).toBeVisible();
  await expect(action).toBeEnabled();
  await action.click({ trial: true });
};

const revealExcelDownloadAction = async (page: Page) => {
  const rail = getPageActionsRail(page);
  const directAction = getExcelDownloadAction(page);

  if (await isActionReady(directAction)) {
    return directAction;
  }

  const railToggle = rail.getByTestId("page-actions-rail-toggle");

  if (await railToggle.isVisible().catch(() => false)) {
    await railToggle.click();
  }

  const excelGroup = rail.getByTestId("nav-action-excel");

  if (await excelGroup.isVisible().catch(() => false)) {
    await excelGroup.click();
  }

  await expectActionReady(directAction);

  return directAction;
};

const downloadExcel = async (page: Page) => {
  const excelAction = await revealExcelDownloadAction(page);
  await expect(excelAction).toBeEnabled();
  const downloadPromise = page.waitForEvent("download");
  await excelAction.click();

  return downloadPromise;
};

const postApi = async <TBody extends Record<string, unknown>>(
  page: Page,
  path: string,
  payload: Record<string, unknown>,
  responseEntity: string,
) => {
  const response = await page.request.post(getE2EAccountApiUrl(path), {
    data: payload,
    headers: await getE2EApiHeaders(page),
  });

  expect(response.status()).toBeLessThan(500);
  expect(response.ok()).toBeTruthy();

  const body = await response.json() as TBody & { statusOk?: boolean };
  expect(body.statusOk, JSON.stringify(body)).toBe(true);
  expect(body[responseEntity], JSON.stringify(body)).toBeTruthy();

  return body;
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

const createCashBalanceForExport = async (page: Page, timestamp: number) => {
  const comment = `E2E Export Cash Balance ${timestamp}`;

  await openCashBalanceModal(page);
  await page.getByTestId("cash-balance-select-all-payment-methods").click();
  await expect(page.locator('input[value="Todos"]')).toBeVisible();
  await page.getByTestId("cash-balance-initial-amount-field").locator("input").fill("100");
  await page.getByTestId("cash-balance-comments-field").fill(comment);

  const cashBalance = await confirmOpenCashBalance(page, comment);
  return cashBalance;
};

const filterById = async (page: Page, value: string) => {
  await page.locator('input[name="id"]').fill(value);
  await page.locator('input[name="id"]').press("Enter");
};

const filterByName = async (page: Page, value: string) => {
  await page.locator('input[name="name"]').fill(value);
  await page.locator('input[name="name"]').press("Enter");
};

const expectExportableRow = async (page: Page, value: string) => {
  await expect(page.getByTestId("table-row").filter({ hasText: value })).toBeVisible({ timeout: 30_000 });
};

const expectExportableRows = async (page: Page) => {
  await expect(page.getByTestId("table-row")).not.toHaveCount(0, { timeout: 30_000 });
};

const readExcelRows = (filePath: string) => {
  const workbook = XLSX.readFile(filePath);
  const [firstSheetName] = workbook.SheetNames;
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, blankrows: false });

  return rows.slice(1);
};

test.describe("exports", () => {
  for (const { entity, path, fileName, matches, batch, order, identity } of [
    { entity: "customers", path: "/clientes", fileName: /lista de clientes\.xlsx$/i, matches: 520, batch: 500, order: "ASC", identity: "name" as const },
    { entity: "expenses", path: "/gastos", fileName: /lista de gastos\.xlsx$/i, matches: 34, batch: 20, order: "ASC", identity: "id" as const },
  ]) {
    test(`exports all applied ${entity} across pages with a pending draft`, async ({ page }) => {
      await loginAsE2EUser(page);

      const dataset = Array.from({ length: matches + 16 }, (_, i) => ({
        id: `A${String(i + 1).padStart(4, "0")}`,
        name: `${i < matches ? "Aplicado" : "Borrador"} ${i + 1}`,
        amount: i + 100,
        state: entity === "customers" ? "ACTIVE" : "PENDING",
        categories: [],
      }));
      const requests: URLSearchParams[] = [];
      const endpoint = new URL(getE2EAccountApiUrl(entity));
      await page.route((url) => url.origin === endpoint.origin && url.pathname === endpoint.pathname, async (route) => {
        const headers = {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "authorization",
          "access-control-allow-methods": "GET, OPTIONS",
        };
        if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
        const params = new URL(route.request().url()).searchParams;
        requests.push(params);
        const filtered = dataset.filter(({ name }) => name.includes(params.get("name") ?? ""));
        const pageSize = Number(params.get("pageSize"));
        const offset = (Number(params.get("pageNumber")) - 1) * pageSize;
        await route.fulfill({ headers, json: {
          statusOk: true,
          [entity]: filtered.slice(offset, offset + pageSize),
          ...(params.get("count") === "true" && { count: filtered.length }),
        } });
      });

      await openListPage(page, path);
      await filterByName(page, "Aplicado");
      await expect(page.getByText(`1 - 20 de ${matches}`, { exact: true })).toBeVisible();
      await expect(page.getByTestId("table-row")).toHaveCount(20);
      await revealExcelDownloadAction(page);
      const exportStart = requests.length;
      await page.locator('input[name="name"]').fill("Borrador");

      const download = await downloadExcel(page);
      expect(download.suggestedFilename()).toMatch(fileName);
      const rows = readExcelRows(await download.path());
      expect(rows.map(([key]) => key)).toEqual(dataset.slice(0, matches).map((row) => row[identity]));
      expect(requests.slice(exportStart).map((params) => Object.fromEntries(params))).toEqual([1, 2].map((pageNumber) => ({
        name: "Aplicado", pageNumber: String(pageNumber), pageSize: String(batch), sort: "id", order, count: String(pageNumber === 1),
        ...(entity === "customers" && { state: "" }),
      })));
    });
  }

  test("keeps the budgets Excel action disabled", async ({ page }) => {
    await loginAsE2EUser(page);
    await openListPage(page, "/ventas");
    const action = getExcelDownloadAction(page);
    await expect(action).toBeVisible();
    await expect(action).toBeDisabled();
  });

  for (const scenario of exportScenarios) {
    test(`exports ${scenario.name} table to Excel`, { tag: scenario.tags }, async ({ page }) => {
      await loginAsE2EUser(page);

      const exportableRowText = scenario.prepare ? await scenario.prepare(page, Date.now()) : null;

      await openListPage(page, scenario.path);

      if (exportableRowText && scenario.filter) {
        await scenario.filter(page, exportableRowText);
        await expectExportableRow(page, exportableRowText);
      } else {
        await expectExportableRows(page);
      }

      await expect(await revealExcelDownloadAction(page)).toBeEnabled();

      const expectedRowsCount = await getExpectedExportRowsCount(page);
      expect(expectedRowsCount, `${scenario.name} should have rows to export`).toBeGreaterThan(0);

      const download = await downloadExcel(page);
      const suggestedFileName = download.suggestedFilename();
      const downloadedPath = await download.path();

      expect(suggestedFileName).toMatch(scenario.expectedFileName);
      expect(downloadedPath).toBeTruthy();

      const exportedRowsCount = readExcelRows(downloadedPath).length;

      expect(exportedRowsCount).toBeGreaterThan(0);
      expect(exportedRowsCount).toBe(expectedRowsCount);
    });
  }
});
