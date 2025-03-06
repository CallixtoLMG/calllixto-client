import { Controller } from "react-hook-form";
import { PercentField } from "./PercentField";

const formatNumber = (value) => {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return '';
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toFixed(2);
};

export const PercentControlled = ({ name, defaultValue, handleChange, ...inputParams }) => {

  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      render={({ field: { onChange, value, ...rest } }) => (
        <PercentField
          {...rest}
          {...inputParams}
          value={formatNumber(value)}
          onChange={value => {
            onChange(value);
            handleChange?.();
          }}
        />
      )}
    />
  )
};
