import { PAGE_CONSTANTS } from "@/common/constants/pages";
import { isCallixtoUser, ROLES } from "@/roles";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const TOKEN_KEY = "token";
const USER_DATA_KEY = "userData";
const SELECTED_ACCOUNT_KEY = "selectedAccountId";
const DEFAULT_SELECTED_ACCOUNT = ROLES.CALLIXTO;

const normalizeBase64 = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
};

const decodeCookieJson = (value) => {
  if (!value) return null;

  try {
    const decodedValue = decodeURIComponent(value);
    return JSON.parse(Buffer.from(normalizeBase64(decodedValue), "base64").toString("utf-8"));
  } catch (error) {
    console.error("Error parsing userData from cookies:", error);
    return null;
  }
};

const getServerAuth = () => {
  const cookieStore = cookies();
  const userData = decodeCookieJson(cookieStore.get(USER_DATA_KEY)?.value);
  const userAccountId = userData?.accountId;
  const accountId = isCallixtoUser(userAccountId)
    ? cookieStore.get(SELECTED_ACCOUNT_KEY)?.value || DEFAULT_SELECTED_ACCOUNT
    : userAccountId;

  return {
    token: cookieStore.get(TOKEN_KEY)?.value,
    accountId,
  };
};

export const getEntityById = async ({ id, path, responseEntity }) => {
  const { token, accountId } = getServerAuth();

  if (!id || !token || !accountId) {
    redirect(PAGE_CONSTANTS.LOGIN.BASE);
  }

  const accountBaseUrl = `${process.env.NEXT_PUBLIC_URL}${accountId}`.replace(/\/$/, "");
  const response = await fetch(`${accountBaseUrl}/${path}/${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if ([401, 403].includes(response.status)) {
    redirect(PAGE_CONSTANTS.LOGIN.BASE);
  }

  if (!response.ok) {
    redirect(PAGE_CONSTANTS.NOT_FOUND.BASE);
  }

  const data = await response.json();
  const entity = data?.[responseEntity];

  if (!entity) {
    redirect(PAGE_CONSTANTS.NOT_FOUND.BASE);
  }

  return entity;
};
