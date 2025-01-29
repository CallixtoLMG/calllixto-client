import { Controller } from "react-hook-form";
import { PercentField } from "./PercentField";

export const PercentControlled = ({ name, defaultValue, handleChange, ...inputParams }) => {
  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      render={({ field: { onChange, ...rest } }) => (
        <PercentField
          {...rest}
          {...inputParams}
          onChange={value => {
            onChange(value);
            handleChange?.();
          }}
        />
      )}
    />
  )
};
