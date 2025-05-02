import { Controller } from "react-hook-form";
import { PercentField } from "./PercentField";

export const PercentControlled = ({
  name,
  defaultValue,
  handleChange,
  disabled,
  justifyItems,
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
          justifyItems={justifyItems}
          disabled={disabled}
          value={value} 
          onChange={(newValue) => {
            onChange(newValue);
            if (handleChange) handleChange(newValue);
          }}
          onBlur={(e) => {
            if (value === '' || value == null) {
              onChange(0);
              handleChange?.(0);
            } else {
              const numericValue = Number(value);
              const fixedValue = numericValue.toFixed(2);
          
              if (numericValue !== Number(fixedValue)) {
                onChange(Number(fixedValue));
                handleChange?.(Number(fixedValue));
              }
            }
          }}
        />
      )}
    />
  );
};
