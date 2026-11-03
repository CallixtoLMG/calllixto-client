import { FormField } from "@/common/components/custom";
import { DropdownControlled } from "@/common/components/form";
import { DatePicker } from "@/common/components/form/DatePicker/DatePicker";
import { CONTENT_SIZES, ERROR_MESSAGES } from "@/common/constants";
import { Controller, useFormContext } from "react-hook-form";
import { getAppliedSalesRangeLabel, getBudgetDateRangeError, getManualBudgetDate, parseBudgetDate } from "./salesDateRange";

const SalesDateFilters = ({ appliedRange, presets = [], disabled }) => {
  const { control, getValues, setValue } = useFormContext();
  const appliedLabel = getAppliedSalesRangeLabel(appliedRange, presets);
  return <>
    <DropdownControlled
      name="presetRange" label="Rangos predefinidos" width={CONTENT_SIZES.FIT} disabled={disabled}
      options={presets.map(({ label, value }) => ({ text: label, value }))}
      afterChange={(value) => {
        const range = presets.find((preset) => preset.value === value)?.getRange();
        if (!range) return;
        Object.entries(range).forEach(([field, date]) => setValue(field, date, { shouldDirty: true }));
        setValue("defaultRangeMonths", "");
      }}
    />
    {[["startDate", "Desde"], ["endDate", "Hasta"]].map(([name, label]) => (
      <Controller key={name} name={name} control={control}
        rules={{ required: ERROR_MESSAGES.REQUIRED_FIELD_SHORT, validate: () => getBudgetDateRangeError(getValues()) || true }}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <FormField control={DatePicker} label={label} required $width="130px" disabled={disabled}
            selected={parseBudgetDate(value)} dateFormat="dd-MM-yyyy"
            error={error && { content: error.message, pointing: "above" }}
            onChange={(date) => {
              onChange(getManualBudgetDate(date, name));
              setValue("presetRange", "");
              setValue("defaultRangeMonths", "");
            }}
          />
        )}
      />
    ))}
    {appliedLabel && <small role="status">Rango aplicado: {appliedLabel}</small>}
  </>;
};

export default SalesDateFilters;
