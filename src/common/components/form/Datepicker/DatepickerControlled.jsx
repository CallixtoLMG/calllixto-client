import es from "date-fns/locale/es";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, useFormContext } from "react-hook-form";
import { FormField } from "../../custom";
registerLocale("es", es);

export const DatePickerControlled = ({
  name,
  flex,
  label,
  width,
  height,
  rules,
  placeholder = "Selecciona una fecha",
  defaultValue,
  dateFormat = "dd-MM-yyyy",
  showTimeSelect = false,
  minDate,
  maxDate,
  disabled,
  showMonthDropdown,
  showYearDropdown,
  scrollableYearDropdown,
  showIcon,
  yearDropdownItemNumber,
  locale = "es",
  icon,
  afterChange,
}) => {
  const { formState: { errors } } = useFormContext();

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <FormField
          flex={flex}
          height={height}
          width={width}
          label={label}
          icon={icon}
          control={ReactDatePicker}
          error={!!errors?.[name] && {
            content: errors[name].message,
            pointing: 'above',
          }}
          selected={value ?? defaultValue}
          onChange={(date) => {
            onChange(date);
            afterChange?.(date);
          }}
          dateFormat={dateFormat}
          showTimeSelect={showTimeSelect}
          minDate={minDate}
          maxDate={maxDate}
          locale={locale}
          disabled={disabled}
          showMonthDropdown={showMonthDropdown}
          showYearDropdown={showYearDropdown}
          showIcon={showIcon}
          placeholderText={placeholder}
          scrollableYearDropdown={scrollableYearDropdown}
          yearDropdownItemNumber={yearDropdownItemNumber}
          dropdownMode="select"
        >
        </FormField>
      )}
    />
  );
};