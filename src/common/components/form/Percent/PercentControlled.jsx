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
            handleChange?.();
          }}
          onBlur={() => {
            if (value !== '') {
              const formattedValue = parseFloat(value).toFixed(2); 
              onChange(formattedValue);
            }
          }}
        />
      )}
    />
  );
};
