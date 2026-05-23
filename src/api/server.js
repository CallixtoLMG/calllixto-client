import { cookies } from "next/headers";
import { ROLES, isCallixtoUser } from "@/roles";

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

export const getServerAccountId = () => {
  const cookieStore = cookies();
  const userData = decodeCookieJson(cookieStore.get(USER_DATA_KEY)?.value);
  const accountId = userData?.accountId;

  if (!accountId) return null;

  if (isCallixtoUser(accountId)) {
    return cookieStore.get(SELECTED_ACCOUNT_KEY)?.value || DEFAULT_SELECTED_ACCOUNT;
  }

  return accountId;
};

export const getServerAuth = () => {
  const cookieStore = cookies();

  return {
    token: cookieStore.get(TOKEN_KEY)?.value,
    accountId: getServerAccountId(),
  };
};

export const getServerEntityById = async ({ id, path, responseEntity }) => {
  const { token, accountId } = getServerAuth();

  if (!id || !token || !accountId) {
    return { [responseEntity]: null, status: 401 };
  }

  const accountBaseUrl = `${process.env.NEXT_PUBLIC_URL}${accountId}`.replace(/\/$/, "");
  const response = await fetch(`${accountBaseUrl}/${path}/${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return { [responseEntity]: null, status: response.status };
  }

  const data = await response.json();

  return {
    [responseEntity]: data?.[responseEntity] ?? null,
    status: response.status,
  };
};
