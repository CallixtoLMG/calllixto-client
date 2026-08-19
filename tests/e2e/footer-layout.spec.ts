import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const ACTIVE_VERSION = "2025-12-17";
const ACCOUNT_ID = "maderera-las-tapias";

const mockBrands = Array.from({ length: 107 }, (_, index) => ({
  id: `${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + ((index + 3) % 26))}`,
  name: `BRAND MOCK ${String(index + 1).padStart(3, "0")}`,
  state: "ACTIVE",
  comments: "",
  createdAt: new Date(2026, 0, 1, 0, 0, index).toISOString(),
  updatedAt: new Date(2026, 0, 1, 0, 0, index).toISOString(),
}));

const VIEWPORTS = [
  { width: 1366, height: 768 },
  { width: 1024, height: 768 },
  { width: 768, height: 900 },
  { width: 480, height: 812 },
  { width: 375, height: 812 },
];

const encodeUserData = (value: unknown) => Buffer.from(JSON.stringify(value), "utf8").toString("base64");

const seedPrivateSession = async (context: BrowserContext, baseURL: string) => {
  const userData = {
    isAuthorized: true,
    role: "callixto",
    roles: ["callixto"],
    name: "Milton Barraza",
    username: "Milton Barraza",
    accounts: {
      items: [{ id: ACCOUNT_ID, name: ACCOUNT_ID }],
    },
  };

  await context.addCookies([
    { name: "token", value: "e2e-layout-token", url: baseURL },
    { name: "userData", value: encodeUserData(userData), url: baseURL },
    { name: "selectedAccountId", value: ACCOUNT_ID, url: baseURL },
  ]);

  await context.addInitScript((activeVersion) => {
    window.localStorage.setItem("latestNews", activeVersion);
  }, ACTIVE_VERSION);
};

const mockListData = async (page: Page) => {
  await page.route("**/brands**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ statusOk: true, brands: mockBrands }),
    });
  });

  await page.route("**/settings**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ statusOk: true, settings: {} }),
    });
  });
};

const measureFooterFlow = async (page: Page) =>
  page.evaluate(() => {
    const footer = document.querySelector("footer");
    const table = document.querySelector("table");
    const lastRow = Array.from(document.querySelectorAll("tbody tr")).at(-1);

    const footerRect = footer?.getBoundingClientRect();
    const tableRect = table?.getBoundingClientRect();
    const lastRowRect = lastRow?.getBoundingClientRect();

    return {
      footerTop: footerRect?.top ?? 0,
      footerBottom: footerRect?.bottom ?? 0,
      contentBottom: Math.max(tableRect?.bottom ?? 0, lastRowRect?.bottom ?? 0),
      footerPosition: footer ? getComputedStyle(footer).position : "",
      rows: document.querySelectorAll("tbody tr").length,
      viewportHeight: window.innerHeight,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

test.describe("private footer layout", () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ context, page, baseURL }) => {
    expect(baseURL, "Playwright baseURL is required").toBeTruthy();
    await seedPrivateSession(context, baseURL!);
    await mockListData(page);
  });

  test("places footer after long marcas content", async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.goto("/marcas", { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("load");
      await expect(page.locator("tbody tr")).toHaveCount(20);

      const atTop = await measureFooterFlow(page);
      expect(atTop.rows).toBe(20);
      expect(atTop.footerPosition).toBe("static");
      expect(atTop.footerTop).toBeGreaterThanOrEqual(atTop.contentBottom);

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const atBottom = await measureFooterFlow(page);
      expect(atBottom.footerPosition).toBe("static");
      expect(atBottom.footerTop).toBeGreaterThanOrEqual(atBottom.contentBottom);
    }
  });

  test("keeps footer at viewport bottom on short private page", async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.goto("/cambiar-contrasena", { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("load");

      const metrics = await measureFooterFlow(page);
      expect(metrics.footerPosition).toBe("static");
      expect(Math.abs(metrics.footerBottom - metrics.viewportHeight)).toBeLessThanOrEqual(1);
      expect(metrics.hasHorizontalOverflow).toBe(false);
    }
  });
});
