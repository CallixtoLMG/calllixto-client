
import { FormField, Input } from "@/components/common/custom";
import { Controller, useFormContext } from "react-hook-form";

export const ControlledInput = ({ name, rules, onChange, width, ...inputProps }) => {
  const { control, formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <FormField
          width={width}
          {...field}
          {...inputProps}
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


