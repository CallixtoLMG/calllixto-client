import { expect, type Page } from "@playwright/test";

export type ContactPhone = {
  ref: string;
  areaCode: string;
  number: string;
};

export type ContactEmail = {
  ref: string;
  email: string;
};

export type ContactAddress = {
  ref: string;
  address: string;
};

export const fillContactField = async (page: Page, testId: string, value: string) => {
  await page.getByTestId(testId).locator("input").fill(value);
};

export const addPhone = async (page: Page, phone: ContactPhone) => {
  await page.getByTestId("contact-add-phone").click();
  await fillContactField(page, "contact-phone-ref", phone.ref);
  await fillContactField(page, "contact-phone-areaCode", phone.areaCode);
  await fillContactField(page, "contact-phone-number", phone.number);
  await page.getByTestId("contact-confirm-phone").click();
};

export const addEmail = async (page: Page, email: ContactEmail) => {
  await page.getByTestId("contact-add-email").click();
  await fillContactField(page, "contact-email-ref", email.ref);
  await fillContactField(page, "contact-email-email", email.email);
  await page.getByTestId("contact-confirm-email").click();
};

export const addAddress = async (page: Page, address: ContactAddress) => {
  await page.getByTestId("contact-add-address").click();
  await fillContactField(page, "contact-address-ref", address.ref);
  await fillContactField(page, "contact-address-address", address.address);
  await page.getByTestId("contact-confirm-address").click();
};

export const waitForEntityDetailUrl = async (page: Page, entityPath: string) => {
  if (isEntityDetailUrl(page, entityPath)) return;

  await page.waitForURL(
    (url) => url.pathname.startsWith(`/${entityPath}/`) && url.pathname !== `/${entityPath}/crear`,
    { timeout: 30_000 },
  );
};

export const isEntityDetailUrl = (page: Page, entityPath: string) => {
  const url = new URL(page.url());
  return url.pathname.startsWith(`/${entityPath}/`) && url.pathname !== `/${entityPath}/crear`;
};

const isEntityListUrl = (page: Page, entityPath: string) => {
  const url = new URL(page.url());
  return url.pathname === `/${entityPath}`;
};

export const dismissUnsavedChangesIfVisible = async (page: Page) => {
  const discardButton = page.getByRole("button", { name: /descartar cambios/i });

  if (await discardButton.isVisible({ timeout: 3_000 })) {
    await discardButton.click();
  }
};

const waitForPostSubmitState = async (page: Page, entityPath: string, timeout = 10_000) => {
  const discardButton = page.getByRole("button", { name: /descartar cambios/i });
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    if (isEntityDetailUrl(page, entityPath)) return "detail";
    if (isEntityListUrl(page, entityPath)) return "list";
    if (await discardButton.isVisible({ timeout: 250 })) return "discard";

    await page.waitForTimeout(250);
  }

  return null;
};

export const waitForEntityDetailAfterSubmit = async (page: Page, entityPath: string) => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (isEntityDetailUrl(page, entityPath)) return;

    const result = await waitForPostSubmitState(page, entityPath);

    if (result === "detail" || isEntityDetailUrl(page, entityPath)) return;
    if (result === "list") return;

    if (result === "discard") {
      const discardButton = page.getByRole("button", { name: /descartar cambios/i });
      await discardButton.click();
    }
  }

  await waitForEntityDetailUrl(page, entityPath);
};

export const deleteCurrentEntity = async (page: Page, actionTestId = "nav-action-eliminar") => {
  await page.getByTestId(actionTestId).click();
  await page.getByTestId("modal-confirmation-input").locator("input").fill("eliminar");
  await page.getByTestId("modal-confirm").click();
};

export const deleteEntityIfPresent = async (
  page: Page,
  entityUrl: string,
  listUrl: RegExp,
  actionTestId = "nav-action-eliminar",
) => {
  try {
    await page.goto(entityUrl);

    const deleteButton = page.getByTestId(actionTestId);
    if (!(await deleteButton.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return;
    }

    await deleteCurrentEntity(page, actionTestId);
    await page.waitForURL(listUrl, { timeout: 30_000 });
  } catch {
    // Best-effort cleanup: keep the original test failure as the useful signal.
  }
};

export const filterByName = async (page: Page, name: string) => {
  await page.locator('input[name="name"]').fill(name);
  await page.locator('input[name="name"]').press("Enter");
};

export const expectEntityDeletedFromActiveList = async (page: Page, name: string) => {
  await filterByName(page, name);
  await expect(page.getByText(/no se encontraron/i)).toBeVisible();
};

export const selectInactiveFilter = async (page: Page) => {
  await page.getByTestId("dropdown-state").click();
  await page.getByRole("option", { name: /inactivos/i }).click();
};
