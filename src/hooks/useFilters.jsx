import { useState } from "react";
import { useForm } from "react-hook-form";

export const useFilters = (defaultFilters) => {
  const methods = useForm({
    defaultValues: defaultFilters,
  });
  const { handleSubmit, reset } = methods;
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const onRestoreFilters = () => {
    reset(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const onSubmit = callback => {
    return handleSubmit(data => {
      reset(data);
      setAppliedFilters(data);
      callback(data);
    });
  }

  return {
    appliedFilters,
    onRestoreFilters,
    onSubmit,
    methods
  };
};
