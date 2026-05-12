import { DEFAULT_SELECTED_ACCOUNT, USER_DATA_KEY } from "@/common/constants";

export const TOKEN_KEY = "token";
export const SELECTED_ACCOUNT_KEY = "selectedAccountId";
export const SESSION_ENDED_NOTIFICATION_KEY = "sessionEndedNotification";

const SESSION_EXPIRATION_KEY = "sessionExpiration";
const DEFAULT_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const COOKIE_PATH = "/";

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

const getDefaultExpiration = () => new Date(Date.now() + DEFAULT_SESSION_DURATION_MS).toISOString();

const normalizeBase64 = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(window.atob(normalizeBase64(payload)));
  } catch (error) {
    console.error("Error decoding JWT payload:", error);
    return null;
  }
};

const getTokenExpiration = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;

  const expiration = new Date(payload.exp * 1000);
  return Number.isNaN(expiration.getTime()) ? null : expiration.toISOString();
};

const encodeJson = (value) => {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return window.btoa(binary);
};

const decodeJson = (value) => {
  const binary = window.atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
};

const buildCookieOptions = (expiresAt) => {
  const parts = [`path=${COOKIE_PATH}`, "SameSite=Lax"];

  if (expiresAt) {
    parts.push(`expires=${new Date(expiresAt).toUTCString()}`);
  }

  if (window.location.protocol === "https:") {
    parts.push("Secure");
  }

  return parts.join("; ");
};

const setCookie = (key, value, expiresAt) => {
  if (!isBrowser()) return;
  document.cookie = `${key}=${encodeURIComponent(value)}; ${buildCookieOptions(expiresAt)}`;
};

const getCookie = (key) => {
  if (!isBrowser()) return null;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${key}=`));

  if (!cookie) return null;
  return decodeURIComponent(cookie.substring(key.length + 1));
};

const removeCookie = (key) => {
  if (!isBrowser()) return;
  document.cookie = `${key}=; path=${COOKIE_PATH}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

export const getToken = () => getCookie(TOKEN_KEY);

export const setToken = (token) => {
  const expiration = getTokenExpiration(token) || getDefaultExpiration();
  setCookie(TOKEN_KEY, token, expiration);
  return expiration;
};

export const getUserData = () => {
  const encodedUserData = getCookie(USER_DATA_KEY);
  if (!encodedUserData) return null;

  try {
    return decodeJson(encodedUserData);
  } catch (error) {
    console.error("Error parsing userData from cookies:", error);
    removeCookie(USER_DATA_KEY);
    return null;
  }
};

export const setUserData = (userData) => {
  setCookie(USER_DATA_KEY, encodeJson(userData), getDefaultExpiration());
};

export const getSelectedAccountId = () => {
  const selectedAccountId = getCookie(SELECTED_ACCOUNT_KEY);
  if (selectedAccountId) return selectedAccountId;

  return DEFAULT_SELECTED_ACCOUNT;
};

export const setSelectedAccountId = (accountId) => {
  setCookie(SELECTED_ACCOUNT_KEY, accountId || DEFAULT_SELECTED_ACCOUNT, getDefaultExpiration());
};

export const clearSession = () => {
  removeCookie(TOKEN_KEY);
  removeCookie(USER_DATA_KEY);
  removeCookie(SESSION_EXPIRATION_KEY);
};

export const markSessionEnded = () => {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(SESSION_ENDED_NOTIFICATION_KEY, "true");
  setCookie(SESSION_ENDED_NOTIFICATION_KEY, "true", new Date(Date.now() + 60 * 1000).toISOString());
};

export const expireSession = () => {
  markSessionEnded();
  clearSession();
};

export const consumeSessionEndedNotification = () => {
  if (!isBrowser()) return false;

  const shouldNotify =
    window.sessionStorage.getItem(SESSION_ENDED_NOTIFICATION_KEY) === "true" ||
    getCookie(SESSION_ENDED_NOTIFICATION_KEY) === "true";

  window.sessionStorage.removeItem(SESSION_ENDED_NOTIFICATION_KEY);
  removeCookie(SESSION_ENDED_NOTIFICATION_KEY);
  return shouldNotify;
};
