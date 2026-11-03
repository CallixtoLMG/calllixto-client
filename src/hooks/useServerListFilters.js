"use client";

import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, SORTING } from "@/common/constants";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const normalizeFilters = (values, defaults) => Object.fromEntries(
  Object.keys(defaults).map((key) => [key, typeof values?.[key] === "string" ? values[key].trim() : defaults[key]])
);

export const getServerListState = ({ defaultFilters, sortFields }, stored = {}) => {
  const pageNumber = Number(stored.page);
  const pageSize = Number(stored.pageSize);
  return {
    appliedFilters: normalizeFilters({ ...defaultFilters, ...stored }, defaultFilters),
    pageNumber: Number.isSafeInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1,
    pageSize: PAGE_SIZE_OPTIONS.some(({ value }) => value === pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    sort: Object.hasOwn(sortFields, stored.sorting?.key) ? sortFields[stored.sorting.key] : sortFields.id,
    order: stored.sorting?.direction === SORTING.DESC ? "desc" : "asc",
  };
};

export const applyServerListFilters = (state, values, defaultFilters) => ({
  ...state, appliedFilters: normalizeFilters(values, defaultFilters), pageNumber: 1,
});

const useServerListFilters = ({ key: initialKey, defaultFilters: initialFilters, sortFields: initialSortFields, onApply, ready = true, getDefaultFilters }) => {
  const [configuration] = useState(() => ({
    key: initialKey, defaultFilters: { ...initialFilters }, sortFields: { ...initialSortFields },
  }));
  const { key, defaultFilters, sortFields } = configuration;
  const [state, setState] = useState(() => ({
    ...getServerListState(configuration), hydrated: false,
  }));
  const methods = useForm({ defaultValues: defaultFilters });
  const { reset, handleSubmit, resetField, setValue } = methods;

  useEffect(() => {
    if (!ready || state.hydrated) return;
    let stored = {};
    try {
      stored = JSON.parse(window.localStorage.getItem(key) || "{}") || {};
    } catch {
    }
    // Dynamic defaults (e.g. a date range resolved from Settings) start a new dataset.
    const defaults = getDefaultFilters?.();
    const restored = getServerListState(configuration, {
      ...stored, ...defaults, ...(defaults && { page: 1 }),
    });
    reset(restored.appliedFilters);
    const initialState = { ...restored, hydrated: true };
    if (defaults) onApply?.(initialState);
    setState(initialState);
  }, [configuration, key, reset, ready, state.hydrated, getDefaultFilters, onApply]);

  const { appliedFilters, pageNumber, pageSize, sort, order, hydrated } = state;
  useEffect(() => {
    if (!hydrated) return;
    const sortKey = Object.keys(sortFields).find((field) => sortFields[field] === sort);
    try {
      window.localStorage.setItem(key, JSON.stringify({
        ...appliedFilters, page: pageNumber, pageSize,
        sorting: { key: sortKey, direction: order === "desc" ? SORTING.DESC : SORTING.ASC },
      }));
    } catch {
    }
  }, [key, appliedFilters, pageNumber, pageSize, sort, order, hydrated, sortFields]);

  const applyFilters = useCallback((values) => {
    if (!ready || !state.hydrated) return;
    const next = applyServerListFilters(state, values, defaultFilters);
    onApply?.(next);
    reset({ ...values, ...next.appliedFilters });
    setState(next);
  }, [state, defaultFilters, onApply, reset, ready]);

  const applyFilterGroup = useCallback((values) => {
    if (!ready || !state.hydrated) return;
    const next = applyServerListFilters(state, { ...state.appliedFilters, ...values }, defaultFilters);
    onApply?.(next);
    Object.entries(values).forEach(([name, value]) => {
      setValue(name, value);
      resetField(name, { defaultValue: value });
    });
    setState(next);
  }, [state, defaultFilters, onApply, ready, setValue, resetField]);

  const setPageNumber = useCallback((value) => {
    const page = Number(value);
    if (Number.isSafeInteger(page) && page > 0) setState((current) => ({ ...current, pageNumber: page }));
  }, []);
  const setPageSize = useCallback((value) => {
    if (PAGE_SIZE_OPTIONS.some((option) => option.value === value)) {
      setState((current) => ({ ...current, pageSize: value, pageNumber: 1 }));
    }
  }, []);
  const setSorting = useCallback((column, direction) => {
    if (!Object.hasOwn(sortFields, column)) return;
    setState((current) => ({ ...current, sort: sortFields[column], order: direction === SORTING.DESC ? "desc" : "asc", pageNumber: 1 }));
  }, [sortFields]);

  return {
    ...state,
    methods,
    onSubmit: handleSubmit(applyFilters),
    onRestoreFilters: () => applyFilters({ ...defaultFilters, ...getDefaultFilters?.() }),
    applyFilterGroup,
    appliedCount: Object.keys(defaultFilters).filter((field) => appliedFilters[field] !== defaultFilters[field]).length,
    setPageNumber,
    setPageSize,
    setSorting,
  };
};

export default useServerListFilters;
