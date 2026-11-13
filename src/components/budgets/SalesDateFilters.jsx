import { FormField } from "@/common/components/custom";
import { DropdownControlled } from "@/common/components/form";
import { DatePicker } from "@/common/components/form/DatePicker/DatePicker";
import { CONTENT_SIZES, ERROR_MESSAGES } from "@/common/constants";
import { Controller, useFormContext } from "react-hook-form";
import { getBudgetDateRangeError, getManualBudgetDate, parseBudgetDate } from "./salesDateRange";

const SalesDateFilters = ({ presets = [], disabled, optional = false }) => {
  const { control, getValues, setValue } = useFormContext();
  return <>
    <DropdownControlled
      name="presetRange" label="Rangos predefinidos" width={CONTENT_SIZES.FIT} disabled={disabled}
      options={presets.map(({ label, value }) => ({ text: label, value }))}
      afterChange={(value) => {
        const range = presets.find((preset) => preset.value === value)?.getRange();
        if (!range) return;
        Object.entries(range).forEach(([field, date]) => setValue(field, date, { shouldDirty: true }));
      }}
    />
    {[["startDate", "Desde"], ["endDate", "Hasta"]].map(([name, label]) => (
      <Controller key={name} name={name} control={control}
        rules={{
          required: !optional && ERROR_MESSAGES.REQUIRED_FIELD_SHORT,
          validate: () => {
            const dates = getValues();
            if (optional && !dates.startDate && !dates.endDate) return true;
            return getBudgetDateRangeError(dates) || true;
          },
        }}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <FormField control={DatePicker} label={label} required={!optional} $width="160px" disabled={disabled}
            selected={parseBudgetDate(value)} dateFormat="dd-MM-yyyy"
            error={error && { content: error.message, pointing: "above" }}
            onChange={(date) => {
              onChange(getManualBudgetDate(date, name));
              setValue("presetRange", "");
            }}
          />
        )}
      />
    ))}
  </>;
};

export default SalesDateFilters;
