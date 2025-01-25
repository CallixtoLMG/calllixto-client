

import { FormField, Input } from "@/components/common/custom";
import { Controller, useFormContext } from "react-hook-form";
import { Icon } from "semantic-ui-react";

export const ControlledPrice = ({ name, rules, label, placeholder, ...inputProps }) => {
  const { control, formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, ...rest } }) => (
        <FormField
          label={label}
          control={Input}
          error={errors?.[name] ? {
            content: errors[name].message,
            pointing: 'above',
          } : null}
        >
          <Input
            {...inputProps}
            {...rest}
            placeholder={placeholder ?? label}
            iconPosition='left'
            onChange={(e) => {
              let value = e.target.value;
              value = value.replace(/,/g, '.');
              const regex = /^[0-9]+([.,][0-9]*)?$/;
              if(regex.test(value) || value === '') {
                const parts = value.split(".");
                if (parts[1] && parts[1].length > 2) {
                  value = parts[0] + "." + parts[1].substring(0, 2);
                }
                onChange(value);
              }
            }}
            onFocus={(e) => e.target.select()}
          >
            <Icon name='dollar' />
            <input />
          </Input>
        </FormField>
      )}
    />
  );
};




