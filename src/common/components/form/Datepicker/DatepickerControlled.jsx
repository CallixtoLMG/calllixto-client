import es from "date-fns/locale/es";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, useFormContext } from "react-hook-form";
import styled from "styled-components";
import { FlexColumn } from "../../custom";
registerLocale("es", es);

const FormFieldLabel = styled.label({
  fontSize: "13px",
  marginBottom: "5px",
  fontWeight: "bold",
});

export const DatepickerControlled = ({
  name,
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
  showIcon,
  icon,
  afterChange
}) => {
  const { formState: { errors } } = useFormContext();

  return (
    <FlexColumn width={width} >
      <FormFieldLabel >{label}</FormFieldLabel>
      <Controller
        name={name}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <ReactDatePicker
            selected={value ?? defaultValue}
            onChange={(date) => {
              onChange(date);
              afterChange?.(date);
            }}
            dateFormat={dateFormat}
            showTimeSelect={showTimeSelect}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            showMonthDropdown={showMonthDropdown}
            showYearDropdown={showYearDropdown}
            showIcon={showIcon}
            placeholderText={placeholder}
            style={{ height }}
          />
        )}
      />
      {errors?.[name] && (
        <span style={{ color: "red", marginTop: "5px" }}>{errors[name]?.message}</span>
      )}
    </FlexColumn>
  );
};