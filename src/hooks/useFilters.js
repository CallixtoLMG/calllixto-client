import { useEffect, useState } from "react";
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
    reset(data);
    setFilters(data);
  });

  useEffect(() => {
    onSubmit(filters);
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
