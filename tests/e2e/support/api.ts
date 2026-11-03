import { expect, type Page, type Response } from "@playwright/test";
import { E2E_ACCOUNTS, getE2EApiBaseUrl } from "./env";

type ApiResponseBody = {
  statusOk?: boolean;
  error?: unknown;
  message?: unknown;
  [key: string]: unknown;
};

type ExpectSuccessfulApiResponseOptions = {
  responseEntity?: string;
  expectedId?: string;
};

const normalizeSuffix = (suffix: string) => suffix.replace(/^\/+|\/+$/g, "");

export const apiPathEndsWith = (url: string, suffix: string) => {
  const pathname = new URL(url).pathname.replace(/\/+$/g, "");
  return pathname.endsWith(`/${normalizeSuffix(suffix)}`);
};

export const isApiResponse = (response: Response, method: string, suffix: string) =>
  response.request().method() === method && apiPathEndsWith(response.url(), suffix);

export const getApiResponseBody = async <TBody extends ApiResponseBody = ApiResponseBody>(response: Response) => {
  try {
    return (await response.json()) as TBody;
  } catch {
    return {} as TBody;
  }
};

export const expectSuccessfulApiResponse = async (
  response: Response,
  { responseEntity, expectedId }: ExpectSuccessfulApiResponseOptions = {},
) => {
  expect(response.status()).toBeLessThan(500);
  expect(response.ok()).toBeTruthy();

  const body = await getApiResponseBody(response);
  expect(body.statusOk, JSON.stringify(body)).toBe(true);

  if (responseEntity) {
    const entity = body[responseEntity] as { id?: string } | undefined;
    expect(entity, JSON.stringify(body)).toBeTruthy();

    if (expectedId) {
      expect(entity?.id, JSON.stringify(body)).toBe(expectedId);
    }
  }

  return body;
};

const getCookieValue = async (page: Page, name: string) =>
  (await page.context().cookies()).find((cookie) => cookie.name === name)?.value;

export const getE2EApiHeaders = async (page: Page) => {
  const token = await getCookieValue(page, "token");
  expect(token, "E2E login should provide an auth token").toBeTruthy();

  return { authorization: `Bearer ${token}` };
};

export const getE2EAccountApiUrl = (path: string, accountName = E2E_ACCOUNTS.modulesEnabled) => {
  const accountBaseUrl = `${getE2EApiBaseUrl().replace(/\/+$/g, "")}/${accountName}/`;
  return new URL(path.replace(/^\/+/g, ""), accountBaseUrl).toString();
};

export const getE2EApiJson = async <TBody extends ApiResponseBody>(
  page: Page,
  path: string,
  accountName = E2E_ACCOUNTS.modulesEnabled,
) => {
  const response = await page.request.get(getE2EAccountApiUrl(path, accountName), {
    headers: await getE2EApiHeaders(page),
  });

  expect(response.status()).toBeLessThan(500);
  expect(response.ok()).toBeTruthy();

  return (await response.json()) as TBody;
};
