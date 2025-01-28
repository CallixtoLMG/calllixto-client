
import { FormField, Input, Label } from "@/components/common/custom";
import { Controller, useFormContext } from "react-hook-form";

export const ControlledInput = ({ name, label, placeholder, rules, iconLabel, width }) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormField
          width={width}
          label={label}
          control={Input}
          error={errors?.[name] ? {
            content: errors[name].message,
            pointing: 'above',
          } : null}
        >
          <Input
            {...field}
            {...(iconLabel && { labelPosition: 'left' })}
            placeholder={placeholder ?? label}
          >
            {iconLabel && <Label width="fit-content" height="100%">{iconLabel}</Label>}
            <input />
          </Input>
        </FormField>
      )}
    />
  );
};


