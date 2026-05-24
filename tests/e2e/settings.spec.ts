import { expect, test, type Locator, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";

type SettingItem = {
  name: string;
  description?: string;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fillTestIdInput = async (page: Page, testId: string, value: string) => {
  await page.getByTestId(testId).locator("input").fill(value);
};

const openSettings = async (page: Page) => {
  await page.goto("/configuracion");
  await expect(page).toHaveURL(/\/configuracion(?:\?|$)/);
};

const openSettingsTab = async (page: Page, tab: "clientes" | "gastos" | "productos" | "general") => {
  await page.goto(`/configuracion?tab=${tab}`);
  await expect(page).toHaveURL(new RegExp(`/configuracion\\?tab=${tab}$`));
};

const openAccordion = async (page: Page, accordionTestId: string, fieldTestId: string) => {
  const field = page.getByTestId(fieldTestId).locator("input");

  if (await field.isVisible({ timeout: 500 })) return;

  await page.getByTestId(accordionTestId).click();
  await expect(field).toBeVisible();
};

const updateCurrentSettingsTab = async (page: Page) => {
  await page.getByTestId("settings-update-button").click();
  await expect(page.getByText(/cambios guardados correctamente/i)).toBeVisible({ timeout: 30_000 });
};

const expectSettingVisible = async (page: Page, value: string) => {
  await expect(page.getByText(value, { exact: true })).toBeVisible({ timeout: 30_000 });
};

const expectDropdownOptionAvailable = async (
  page: Page,
  dropdownTestId: string,
  value: string,
  scope?: Page | Locator,
) => {
  const dropdown = (scope ?? page).getByTestId(dropdownTestId);

  await expect(dropdown).toBeVisible({ timeout: 30_000 });
  await dropdown.click();
  await expect(page.getByRole("option", { name: new RegExp(escapeRegExp(value), "i") })).toBeVisible({
    timeout: 30_000,
  });
  await page.keyboard.press("Escape");
};

const addSettingLabel = async (page: Page, item: SettingItem) => {
  await openAccordion(page, "settings-tags-accordion", "settings-tag-name-field");
  await fillTestIdInput(page, "settings-tag-name-field", item.name);
  await fillTestIdInput(page, "settings-tag-description-field", item.description ?? "");
  await page.getByTestId("settings-tag-description-field").locator("input").press("Enter");
  await expectSettingVisible(page, item.name);
};

const addSettingCategory = async (page: Page, item: SettingItem) => {
  await openAccordion(page, "settings-categories-accordion", "settings-category-name-field");
  await fillTestIdInput(page, "settings-category-name-field", item.name);
  await fillTestIdInput(page, "settings-category-description-field", item.description ?? "");
  await page.getByTestId("settings-category-description-field").locator("input").press("Enter");
  await expectSettingVisible(page, item.name);
};

const addBlockedProduct = async (page: Page, productId: string) => {
  await openAccordion(page, "settings-blocked-products-accordion", "settings-blocked-product-field");
  await fillTestIdInput(page, "settings-blocked-product-field", productId);
  await page.getByTestId("settings-blocked-product-field").locator("input").press("Enter");
  await expectSettingVisible(page, productId);
};

const addPaymentMethod = async (page: Page, method: string) => {
  await openAccordion(page, "settings-payment-methods-accordion", "settings-payment-method-field");
  await fillTestIdInput(page, "settings-payment-method-field", method);
  await page.getByTestId("settings-payment-method-field").locator("input").press("Enter");
  await expectSettingVisible(page, method);
};

const assertCustomerLabelAvailable = async (page: Page, label: string) => {
  await page.goto("/clientes/crear");
  await expect(page).toHaveURL(/\/clientes\/crear(?:\?|$)/);
  await expectDropdownOptionAvailable(page, "dropdown-tags", label);
};

const assertExpenseSettingsAvailable = async (page: Page, labels: SettingItem[], categories: SettingItem[]) => {
  await page.goto("/gastos/crear");
  await expect(page).toHaveURL(/\/gastos\/crear(?:\?|$)/);

  for (const category of categories) {
    await expectDropdownOptionAvailable(page, "dropdown-categories", category.name);
  }

  for (const label of labels) {
    await expectDropdownOptionAvailable(page, "dropdown-tags", label.name);
  }
};

const assertProductSettingsAvailable = async (page: Page, label: string, blockedProductId: string) => {
  await openSettingsTab(page, "productos");
  await page.reload();
  await openAccordion(page, "settings-blocked-products-accordion", "settings-blocked-product-field");
  await expectSettingVisible(page, blockedProductId);

  await page.goto("/productos/crear");
  await expect(page).toHaveURL(/\/productos\/crear(?:\?|$)/);
  await expectDropdownOptionAvailable(page, "dropdown-tags", label);
};

const assertPaymentMethodAvailable = async (page: Page, method: string) => {
  await page.goto("/cajas");
  await expect(page).toHaveURL(/\/cajas(?:\?|$)/);
  await expect(page.getByTestId("nav-action-abrir")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("nav-action-abrir").click();
  const modal = page.getByTestId("open-cash-balance-modal");
  await expect(modal).toBeVisible({ timeout: 30_000 });
  await expectDropdownOptionAvailable(page, "dropdown-paymentMethods", method, modal);
};

test.describe("settings", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
  });

  test("adds settings for customers, expenses, products, and general", async ({ page }) => {
    test.setTimeout(180_000);

    const timestamp = Date.now();

    await openSettings(page);

    await openSettingsTab(page, "clientes");
    const customerLabel = {
      name: `E2E Cliente Label ${timestamp}`,
      description: `Descripcion E2E cliente ${timestamp}`,
    };
    await addSettingLabel(page, customerLabel);
    await updateCurrentSettingsTab(page);
    await expectSettingVisible(page, customerLabel.name);
    await assertCustomerLabelAvailable(page, customerLabel.name);

    await openSettingsTab(page, "gastos");
    const expenseLabels = [
      {
        name: `E2E Gasto Label A ${timestamp}`,
        description: `Descripcion E2E gasto label A ${timestamp}`,
      },
      {
        name: `E2E Gasto Label B ${timestamp}`,
        description: `Descripcion E2E gasto label B ${timestamp}`,
      },
    ];
    const expenseCategories = [
      {
        name: `E2E Gasto Category A ${timestamp}`,
        description: `Descripcion E2E gasto category A ${timestamp}`,
      },
      {
        name: `E2E Gasto Category B ${timestamp}`,
        description: `Descripcion E2E gasto category B ${timestamp}`,
      },
    ];

    for (const label of expenseLabels) {
      await addSettingLabel(page, label);
    }
    for (const category of expenseCategories) {
      await addSettingCategory(page, category);
    }
    await updateCurrentSettingsTab(page);
    for (const item of [...expenseLabels, ...expenseCategories]) {
      await expectSettingVisible(page, item.name);
    }
    await assertExpenseSettingsAvailable(page, expenseLabels, expenseCategories);

    await openSettingsTab(page, "productos");
    const productLabel = {
      name: `E2E Producto Label ${timestamp}`,
      description: `Descripcion E2E producto ${timestamp}`,
    };
    const blockedProductId = `E2EBLOQ${String(timestamp).slice(-6)}`;
    await addSettingLabel(page, productLabel);
    await addBlockedProduct(page, blockedProductId);
    await updateCurrentSettingsTab(page);
    await expectSettingVisible(page, productLabel.name);
    await expectSettingVisible(page, blockedProductId);
    await assertProductSettingsAvailable(page, productLabel.name, blockedProductId);

    await openSettingsTab(page, "general");
    const paymentMethod = `E2E Payment Method ${timestamp}`;
    await addPaymentMethod(page, paymentMethod);
    await updateCurrentSettingsTab(page);
    await expectSettingVisible(page, paymentMethod);
    await assertPaymentMethodAvailable(page, paymentMethod);
  });
});
