import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import useFilterParams from "./useFilterParams";
import { omit } from "lodash";

const useFilters = ({ defaultFilters, key }) => {
  const { filters, setFilters } = useFilterParams({
    key,
    defaultParams: defaultFilters,
  });

  const [hydrated, setHydrated] = useState(false);

  const methods = useForm({
    defaultValues: defaultFilters,
  });
  const { handleSubmit, reset } = methods;

  const onRestoreFilters = () => {
    reset(defaultFilters);
    setFilters(defaultFilters);
  };

  const onSubmit = handleSubmit(data => {
    const mergedData = { ...defaultFilters, ...filters, ...data };
    reset(mergedData);
    setFilters(mergedData);
  });

  useEffect(() => {
    reset(filters);
    setHydrated(true);
  }, [filters, reset]);

  const appliedCount = useMemo(() => {
    return Object.keys(omit(defaultFilters, ['sorting'])).reduce((acc, key) => {
      if (filters[key] !== defaultFilters[key]) {
        acc += 1;
      }
      return acc;
    }, 0);
  }, [filters, defaultFilters]);

  return {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  };
};

export default useFilters;
