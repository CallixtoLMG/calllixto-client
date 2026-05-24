import { expect, test, type Page } from "@playwright/test";
import * as XLSX from "xlsx";
import { loginAsE2EUser } from "./support/auth";

type ExportScenario = {
  name: string;
  path: string;
  expectedFileName: RegExp;
};

const exportScenarios: ExportScenario[] = [
  { name: "customers", path: "/clientes", expectedFileName: /lista de clientes\.xlsx$/i },
  { name: "suppliers", path: "/proveedores", expectedFileName: /lista de proveedores\.xlsx$/i },
  { name: "brands", path: "/marcas", expectedFileName: /lista de marcas\.xlsx$/i },
  { name: "products", path: "/productos", expectedFileName: /lista de productos\.xlsx$/i },
  { name: "expenses", path: "/gastos", expectedFileName: /lista de gastos\.xlsx$/i },
  { name: "budgets", path: "/ventas", expectedFileName: /lista de ventas\.xlsx$/i },
  { name: "cash balances", path: "/cajas", expectedFileName: /lista de cajas\.xlsx$/i },
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
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
  });

  for (const scenario of exportScenarios) {
    test(`exports ${scenario.name} table to Excel`, async ({ page }) => {
      await openListPage(page, scenario.path);

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
