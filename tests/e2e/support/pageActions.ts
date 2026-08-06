import { expect, type Locator, type Page } from "@playwright/test";

export const getPageActionsRail = (page: Page) => page.getByTestId("page-actions-aside");

export const expandPageActionsRail = async (page: Page) => {
  const rail = getPageActionsRail(page);
  await expect(rail).toBeAttached();

  const railToggle = rail.getByTestId("page-actions-rail-toggle");

  if (await railToggle.getAttribute("aria-expanded") === "false") {
    await railToggle.click();
    await expect(railToggle).toHaveAttribute("aria-expanded", "true");
  }

  return rail;
};

export const getPageAction = async (page: Page, testId: string): Promise<Locator> => {
  const rail = await expandPageActionsRail(page);
  return rail.getByTestId(testId);
};

export const expectPageActionReady = async (page: Page, testId: string) => {
  const action = await getPageAction(page, testId);
  await expect(action).toBeVisible();
  await expect(action).toBeEnabled();
  await action.click({ trial: true });
  return action;
};

export const clickPageAction = async (page: Page, testId: string) => {
  const action = await expectPageActionReady(page, testId);
  await action.click();
  return action;
};
