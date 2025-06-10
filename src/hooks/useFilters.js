import { useEffect } from "react";
import { useForm } from "react-hook-form";
import useFilterParams from "./useFilterParams";

const useFilters = ({ defaultFilters, key }) => {
  const { filters, setFilters } = useFilterParams({
    key,
    defaultParams: defaultFilters,
  });

  const methods = useForm({
    defaultValues: filters,
  });
  const { handleSubmit, reset } = methods;

  const onRestoreFilters = () => {
    reset(defaultFilters);
    setFilters(defaultFilters);
  };

  const onSubmit = handleSubmit(data => {
    const mergedData = { ...filters, ...data };
    reset(mergedData);
    setFilters(mergedData);
  });

  useEffect(() => {
    onSubmit(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods
  };
};

export default useFilters;
