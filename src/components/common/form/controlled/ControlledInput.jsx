
import { FormField, Input } from "@/components/common/custom";
import { Controller, useFormContext } from "react-hook-form";

export const ControlledInput = ({ name, label, placeholder, rules, onChange, width, ...inputProps }) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormField
          {...field}
          {...inputProps}
          width={width}
          label={label}
          placeholder={placeholder ?? label}
          {...(onChange && { onChange: (e) => field.onChange(onChange(e)) })}
          error={errors?.[name] ? {
            content: errors[name].message,
            pointing: 'above',
          } : null}
          control={Input}
        />
      )}
    />
  );
};


