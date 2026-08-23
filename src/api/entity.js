import { LOGIN_PAGE, NOT_FOUND_PAGE } from "@/common/constants/routes";
import { SELECTED_ACCOUNT_KEY, TOKEN_KEY, USER_DATA_KEY } from "@/common/constants/session";
import { isCallixtoUser } from "@/roles";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
  const role = userData?.role ?? userData?.roles?.[0];
  const accountId = isCallixtoUser(role)
    ? cookieStore.get(SELECTED_ACCOUNT_KEY)?.value ?? userData?.accounts?.items?.[0]?.id
    : userData?.accountId;

  return {
    token: cookieStore.get(TOKEN_KEY)?.value,
    accountId,
  };
};

export const getEntityById = async ({ id, path, responseEntity }) => {
  const { token, accountId } = getServerAuth();

  if (!id || !token || !accountId) {
    redirect(LOGIN_PAGE);
  }

  const baseUrl = `${process.env.NEXT_PUBLIC_URL}${accountId}`.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/${path}/${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if ([401, 403].includes(response.status)) {
    redirect(LOGIN_PAGE);
  }

  if (!response.ok) {
    redirect(NOT_FOUND_PAGE);
  }

  const data = await response.json();
  const entity = data?.[responseEntity];

  if (!entity) {
    redirect(NOT_FOUND_PAGE);
  }

  return entity;
};
