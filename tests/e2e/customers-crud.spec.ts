import { expect, test, type Page } from "@playwright/test";
import { loginAsE2EUser } from "./support/auth";
import {
  addAddress,
  addEmail,
  addPhone,
  deleteCurrentEntity,
  deleteEntityIfPresent,
  dismissUnsavedChangesIfVisible,
  expectEntityDeletedFromActiveList,
  filterByName,
  selectInactiveFilter,
  type ContactAddress,
  type ContactEmail,
  type ContactPhone,
  waitForEntityDetailUrl,
} from "./support/entities";

type CustomerFixture = {
  name: string;
  phones?: ContactPhone[];
  emails?: ContactEmail[];
  addresses?: ContactAddress[];
  comments?: string;
  tagsCount?: number;
};

const openCustomersList = async (page: Page) => {
  await page.goto("/clientes");
  await expect(page).toHaveURL(/\/clientes(?:\?|$)/);
  await expect(page.getByTestId("nav-action-crear")).toBeVisible();
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
    .filter({ hasNotText: /no hay|no se encontraron/i });

  if (!(await options().count())) {
    await page.keyboard.press("Escape");
    return selectedTags;
  }

  for (let index = 0; index < requestedCount; index += 1) {
    const currentOptions = options();
    if (!(await currentOptions.count())) {
      break;
    }

    const option = currentOptions.nth(0);
    const text = (await option.innerText()).trim();
    selectedTags.push(text);
    await option.click();
  }

  return selectedTags;
};

const createCustomer = async (page: Page, customer: CustomerFixture) => {
  await openCustomersList(page);
  await page.getByTestId("nav-action-crear").click();
  await expect(page).toHaveURL(/\/clientes\/crear(?:\?|$)/);

  await page.locator('input[name="name"]').fill(customer.name);

  for (const phone of customer.phones ?? []) {
    await addPhone(page, phone);
  }

  for (const email of customer.emails ?? []) {
    await addEmail(page, email);
  }

  for (const address of customer.addresses ?? []) {
    await addAddress(page, address);
  }

  if (customer.comments) {
    await page.getByPlaceholder("No era tan bueno").fill(customer.comments);
  }

  const selectedTags = customer.tagsCount
    ? await selectAvailableTags(page, customer.tagsCount)
    : [];

  await page.locator("form").getByRole("button", { name: /crear/i }).click();
  await dismissUnsavedChangesIfVisible(page);
  await waitForEntityDetailUrl(page, "clientes");

  return {
    url: page.url(),
    selectedTags,
  };
};

const deleteCurrentCustomer = async (page: Page) => {
  await deleteCurrentEntity(page);
  await expect(page).toHaveURL(/\/clientes(?:\?|$)/, { timeout: 30_000 });
};

const expectCustomerName = async (page: Page, name: string) => {
  await expect(page.getByTestId("customer-name-field")).toContainText(name, { timeout: 30_000 });
};

test.describe("customers", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page);
  });

  test("creates, updates, and deletes a customer", async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const customerName = `E2E Customer Test ${timestamp}`;
    const updatedCustomerName = `${customerName} Updated`;
    const customerEmail = `e2e.customer.${timestamp}@test.com`;
    let createdCustomerUrl: string | null = null;

    try {
      const createdCustomer = await createCustomer(page, {
        name: customerName,
        phones: [{ ref: "Casa", areaCode: "385", number: "5555555" }],
        emails: [{ ref: "Trabajo", email: customerEmail }],
      });
      createdCustomerUrl = createdCustomer.url;

      await expectCustomerName(page, customerName);
      await expect(page.getByText("3855555555")).toBeVisible();

      await page.getByRole("button", { name: /^actualizar$/i }).click();
      await page.locator('input[name="name"]').fill(updatedCustomerName);
      await page.locator("form").getByRole("button", { name: /actualizar/i }).click();
      await expectCustomerName(page, updatedCustomerName);

      await deleteCurrentCustomer(page);
      createdCustomerUrl = null;
      await expectEntityDeletedFromActiveList(page, updatedCustomerName);
    } finally {
      if (createdCustomerUrl) {
        await deleteEntityIfPresent(page, createdCustomerUrl, /\/clientes(?:\?|$)/);
      }
    }
  });

  test("creates a customer with multiple contacts, comments, and available tags", async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const customerName = `E2E Customer Test ${timestamp}`;
    const comment = `Comentario E2E customer ${timestamp}`;
    let createdCustomerUrl: string | null = null;

    try {
      const createdCustomer = await createCustomer(page, {
        name: customerName,
        phones: [
          { ref: "Casa", areaCode: "385", number: "5555555" },
          { ref: "Trabajo", areaCode: "385", number: "4444444" },
        ],
        emails: [
          { ref: "Casa", email: `e2e.customer.${timestamp}@test.com` },
          { ref: "Trabajo", email: `e2e.customer.alt.${timestamp}@test.com` },
        ],
        addresses: [
          { ref: "Casa", address: "Calle Falsa 123" },
          { ref: "Trabajo", address: "Avenida Siempre Viva 742" },
        ],
        comments: comment,
        tagsCount: 2,
      });
      createdCustomerUrl = createdCustomer.url;

      await expectCustomerName(page, customerName);
      await expect(page.getByText("3855555555")).toBeVisible();
      await expect(page.getByText("3854444444")).toBeVisible();
      await expect(page.getByText(`e2e.customer.${timestamp}@test.com`)).toBeVisible();
      await expect(page.getByText(`e2e.customer.alt.${timestamp}@test.com`)).toBeVisible();
      await expect(page.getByText("Calle Falsa 123")).toBeVisible();
      await expect(page.getByText("Avenida Siempre Viva 742")).toBeVisible();
      await expect(page.getByPlaceholder("No era tan bueno")).toHaveValue(comment);

      // Tags come from customer settings. If none are configured locally, the scenario still covers the field safely.
      for (const tag of createdCustomer.selectedTags) {
        await expect(page.getByText(tag)).toBeVisible();
      }

      await deleteCurrentCustomer(page);
      createdCustomerUrl = null;
    } finally {
      if (createdCustomerUrl) {
        await deleteEntityIfPresent(page, createdCustomerUrl, /\/clientes(?:\?|$)/);
      }
    }
  });

  test("deactivates and reactivates a customer", async ({ page }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const customerName = `E2E Customer Test ${timestamp}`;
    const inactiveReason = `Motivo E2E customer ${timestamp}`;
    let createdCustomerUrl: string | null = null;

    try {
      const createdCustomer = await createCustomer(page, {
        name: customerName,
      });
      createdCustomerUrl = createdCustomer.url;

      await page.getByTestId("nav-action-desactivar").click();
      await page.getByPlaceholder(/motivo/i).fill(inactiveReason);
      await page.getByTestId("modal-confirm").click();
      await expect(page.getByText(inactiveReason)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("nav-action-activar")).toBeVisible();

      await openCustomersList(page);
      await selectInactiveFilter(page);
      await filterByName(page, customerName);
      await expect(page.getByText(customerName)).toBeVisible();

      await page.getByText(customerName).click();
      await expect(page).toHaveURL(/\/clientes\/[^/]+(?:\?|$)/, { timeout: 30_000 });
      await page.getByTestId("nav-action-activar").click();
      await page.getByTestId("modal-confirm").click();
      await expect(page.getByTestId("nav-action-desactivar")).toBeVisible({ timeout: 30_000 });

      await deleteCurrentCustomer(page);
      createdCustomerUrl = null;
    } finally {
      if (createdCustomerUrl) {
        await deleteEntityIfPresent(page, createdCustomerUrl, /\/clientes(?:\?|$)/);
      }
    }
  });
});
