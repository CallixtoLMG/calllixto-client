import { Controller } from "react-hook-form";
import { PercentField } from "./PercentField";

export const PercentControlled = ({
  name,
  defaultValue,
  handleChange,
  disabled,
  ...inputParams
}) => {
  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      render={({ field: { onChange, value, ...rest } }) => (
        <PercentField
          {...rest}
          {...inputParams}
          disabled={disabled}
          value={value} 
          onChange={(newValue) => {
            onChange(newValue);
            if (handleChange) handleChange(newValue);
          }}
          onBlur={() => {
            if (value !== '') {
              const numericValue = Number(value);
              const fixedValue = numericValue.toFixed(2);
          
              if (numericValue !== Number(fixedValue)) {
                onChange(Number(fixedValue));
              }
            }
          }}
        />
      )}
    />
  );
};
