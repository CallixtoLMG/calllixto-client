import { Controller, useFormContext } from "react-hook-form";
import { PriceField } from "./PriceField";

export const PriceControlled = ({
  width,
  name,
  rules,
  label,
  placeholder,
  onChange,
  disabled,
  onAfterChange,
  handlePriceChange,
  ...inputProps
}) => {
  const { formState: { errors } } = useFormContext();

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, value } }) => {
        return (
          <PriceField
            {...inputProps}
            label={label}
            width={width}
            value={value}
            onChange={(newValue) => {
              onChange(newValue);   
              onAfterChange?.(newValue);    
            }}
            disabled={disabled}
            placeholder={placeholder ?? label}
            error={errors?.[name] && {
              content: errors[name].message,
              pointing: 'above',
            }}
          />
        );
      }}
    />
  );
};
