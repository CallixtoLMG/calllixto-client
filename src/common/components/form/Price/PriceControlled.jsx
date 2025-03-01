import { FormField, Input } from "@/common/components/custom";
import { ICONS } from "@/common/constants";
import { Controller, useFormContext } from "react-hook-form";
import { Icon } from "semantic-ui-react";

export const PriceControlled = ({
  width,
  name,
  rules,
  label,
  placeholder,
  onChange,
  ...inputProps
}) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange: onChangeController, value, ...rest } }) => (
        <FormField
          width={width}
          label={label}
          control={Input}
          error={errors?.[name] && {
            content: errors[name].message,
            pointing: 'above',
          }}
        >
          <Input
            {...inputProps}
            {...rest}
            value={value?.toLocaleString() ?? 0}
            placeholder={placeholder ?? label}
            iconPosition="left"
            onChange={(e) => {
              let newValue = e.target.value.replace(/[^0-9.]/g, '');
              if (!isNaN(newValue)) {
                newValue = Number(newValue);
                onChangeController(newValue);
                onChange?.(newValue);
              }
            }}
            onFocus={(e) => e.target.select()}
          >
            <Icon name={ICONS.DOLLAR} />
            <input />
          </Input>
        </FormField>
      )}
    />
  );
};
