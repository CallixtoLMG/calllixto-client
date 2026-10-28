import { LIST_FILTER_MAPPING, toListFilterParams } from "@/api/listFilters";
import { getListPageState } from "@/api/listPagination";
import { ALL } from "@/common/constants";
import { omit, pick } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import useFilterParams from "./useFilterParams";

// Prevent native/combobox Enter from submitting twice; both paths use Form's
// existing onSubmit handler, exactly like its Buscar submit button.
export function handleFilterEnter(event) {
  if (event.key !== 'Enter' || event.nativeEvent?.isComposing || event.isComposing) return;
  if (event.target?.tagName !== 'INPUT' || !['text', 'search', 'email', 'tel', 'url'].includes(event.target.type)) return;
  const form = event.target.closest('form');
  if (!form) return;
  event.preventDefault();
  event.stopPropagation();
  if (!event.repeat) form.requestSubmit();
}

const useFilters = ({ defaultFilters, key, remoteEntity, resetKey }) => {
  const { filters, setFilters, hydrated } = useFilterParams({
    key,
    defaultParams: defaultFilters,
  });

  const initialized = useRef(false);
  const [filterApplication, setFilterApplication] = useState(0);

  const methods = useForm({
    defaultValues: defaultFilters,
  });
  const { handleSubmit, reset } = methods;
  const draftFilters = useWatch({ control: methods.control, defaultValue: defaultFilters });

  const applyFilters = useCallback(data => {
    // Pagination/sort belong to applied state, never stale form defaults.
    const mergedData = remoteEntity
      ? { ...filters, ...pick(data, Object.keys(LIST_FILTER_MAPPING[remoteEntity] ?? {})), page: 1 }
      : { ...defaultFilters, ...filters, ...data };
    reset(mergedData);
    setFilters(mergedData);
    if (remoteEntity) setFilterApplication(value => value + 1);
  }, [defaultFilters, filters, remoteEntity, reset, setFilters]);

  const onRestoreFilters = () => {
    const cleared = Object.fromEntries(Object.entries(LIST_FILTER_MAPPING[remoteEntity] ?? {}).map(([field, config]) => [
      field, config.type === 'selection' && defaultFilters[field] === ALL ? ALL : '',
    ]));
    const restored = remoteEntity ? { ...filters, ...cleared, page: 1 } : defaultFilters;
    reset(restored);
    setFilters(restored);
    if (remoteEntity) setFilterApplication(value => value + 1);
  };

  const onSubmit = handleSubmit(applyFilters);

  useEffect(() => {
    if (!hydrated) return;
    if (!initialized.current || !remoteEntity) reset(filters);
    initialized.current = true;
  }, [filters, reset, remoteEntity, hydrated]);

  const queryParams = useMemo(() => toListFilterParams(remoteEntity, filters), [remoteEntity, filters]);
  const appliedCount = useMemo(() => {
    if (remoteEntity) return Object.keys(queryParams).length;
    return Object.keys(omit(defaultFilters, ['sorting'])).reduce((acc, key) => {
      if (filters[key] !== defaultFilters[key]) {
        acc += 1;
      }
      return acc;
    }, 0);
  }, [filters, defaultFilters, remoteEntity, queryParams]);

  const listRequest = useMemo(() => ({ remoteFilters: queryParams, ...getListPageState(filters), filterApplication }), [queryParams, filters, filterApplication]);

  return {
    onRestoreFilters,
    onSubmit,
    filters,
    appliedFilters: filters,
    draftFilters,
    filterApplication,
    setFilters,
    methods,
    appliedCount,
    hydrated,
    queryParams,
    listRequest,
    remoteFiltersActive: Object.keys(queryParams).length > 0,
    paginationResetKey: JSON.stringify([queryParams, resetKey]),
  };
};

export default useFilters;
