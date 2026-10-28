'use client';
import { useCallback, useEffect, useState } from 'react';
import { omit, pick, isEqual } from 'lodash';

const getStoredFilters = (key) => {
  if (typeof window !== 'undefined') {
    const storedItem = window?.localStorage.getItem(key);
    const sessionItem = window?.sessionStorage.getItem(key);
    return storedItem ? { ...JSON.parse(storedItem), ...JSON.parse(sessionItem ?? '{}') } : {};
  }
  return {};
};

const useFilterParams = ({ key, defaultParams, sessionParams }) => {
  // Storage is browser-only: SSR and the first client render use defaults.
  // Publish restored filters and readiness together so queries never fetch
  // disposable defaults before the saved page/size/sort is available.
  const [{ filters, hydrated }, setState] = useState(() => ({
    filters: { ...defaultParams }, hydrated: false,
  }));

  useEffect(() => {
    const storedFilters = getStoredFilters(key);
    setState(current => ({ filters: { ...current.filters, ...storedFilters }, hydrated: true }));
  }, [key]);

  const onParamsChange = useCallback((newParams) => {
    if (isEqual(filters, newParams)) {
      return;
    }

    window?.localStorage.setItem(
      key,
      JSON.stringify(omit(newParams, sessionParams ?? '')),
    );
    if (sessionParams?.length) {
      window?.sessionStorage.setItem(key, JSON.stringify(pick(newParams, sessionParams)));
    }

    setState(current => ({ ...current, filters: newParams }));
  }, [filters, key, sessionParams]);

  return { filters, setFilters: onParamsChange, hydrated };
};

export default useFilterParams;
