'use client';
import { useState } from 'react';
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
  const [filters, setFilters] = useState({
    ...defaultParams,
    ...getStoredFilters(key),
  });

  const onParamsChange = (newParams) => {
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

    setFilters(newParams);
  };

  return { filters, setFilters: onParamsChange };
};

export default useFilterParams;
