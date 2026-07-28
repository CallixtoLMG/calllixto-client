"use client";

import { PUBLIC_BUDGETS_PAGE } from "@/common/constants/routes";

const PUBLIC_BUDGET_SNAPSHOTS_KEY = "callixto.publicBudgetSnapshots";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const readSnapshots = () => {
  if (!isBrowser()) return {};

  try {
    const rawSnapshots = window.localStorage.getItem(PUBLIC_BUDGET_SNAPSHOTS_KEY);
    if (!rawSnapshots) return {};

    const snapshots = JSON.parse(rawSnapshots);
    return snapshots && typeof snapshots === "object" && !Array.isArray(snapshots)
      ? snapshots
      : {};
  } catch (error) {
    console.error("Error leyendo presupuesto publico mock:", error);
    return {};
  }
};

const writeSnapshots = (snapshots) => {
  if (!isBrowser()) return false;

  try {
    window.localStorage.setItem(PUBLIC_BUDGET_SNAPSHOTS_KEY, JSON.stringify(snapshots));
    return true;
  } catch (error) {
    console.error("Error guardando presupuesto publico mock:", error);
    return false;
  }
};

export const getPublicBudgetPath = (id) => `${PUBLIC_BUDGETS_PAGE}/${encodeURIComponent(id)}`;

export const getPublicBudgetUrl = (id, origin = "") => {
  const resolvedOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return `${resolvedOrigin}${getPublicBudgetPath(id)}`;
};

export const savePublicBudgetSnapshot = (snapshot) => {
  const id = snapshot?.budget?.id;

  if (!id) {
    return { ok: false, error: "missing-budget-id" };
  }

  // TODO: reemplazar este localStorage mock por endpoint publico real.
  const snapshots = readSnapshots();
  const url = getPublicBudgetUrl(id);
  const nextSnapshot = {
    ...snapshot,
    id,
    url,
    savedAt: new Date().toISOString(),
  };

  const ok = writeSnapshots({
    ...snapshots,
    [id]: nextSnapshot,
  });

  return ok
    ? { ok: true, snapshot: nextSnapshot, url }
    : { ok: false, error: "storage-error" };
};

export const getPublicBudgetSnapshot = (id) => {
  if (!id) return null;

  const snapshot = readSnapshots()[id];
  if (!snapshot || typeof snapshot !== "object" || snapshot.id !== id || !snapshot.budget) {
    return null;
  }

  return snapshot;
};

