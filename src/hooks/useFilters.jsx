import { useState } from "react";
import { useForm } from "react-hook-form";

export const useFilters = (defaultFilters, keysToFilter = []) => {
  const { handleSubmit, control, reset, watch, formState, setValue } = useForm({
    defaultValues: defaultFilters,
  });
  const { isDirty } = formState;
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const currentFilters = watch();

  const hasUnsavedFilters = () =>
    keysToFilter.length > 0
      ? keysToFilter.some(
        key => currentFilters[key] !== appliedFilters[key]
      )
      : Object.keys(currentFilters).some(
        key => key !== "state" && currentFilters[key] !== appliedFilters[key]
      );

  const onRestoreFilters = () => {
    reset(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const onSubmit = callback =>
    handleSubmit(data => {
      setAppliedFilters(data);
      callback(data);
    });


  const onStateChange = value => {
    setAppliedFilters(prev => ({ ...prev, state: value }));
    setValue("state", value, { shouldDirty: false });
  };

  return {
    control,
    currentFilters,
    appliedFilters,
    hasUnsavedFilters,
    onRestoreFilters,
    onSubmit,
    onStateChange,
    isDirty,
  };
};
