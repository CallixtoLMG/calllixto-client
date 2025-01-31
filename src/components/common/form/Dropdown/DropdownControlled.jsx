
import { FormField } from "@/components/common/custom";
import { Controller, useFormContext } from "react-hook-form";
import { Dropdown } from "../../custom";

export const DropdownControlled = ({
  name,
  width,
  label,
  rules,
  placeholder,
  options = [],
  defaultValue,
  afterChange,
  disabled
}) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, ...rest } }) => (
        <FormField
          {...rest}
          width={width}
          label={label}
          placeholder={placeholder ?? label}
          control={Dropdown}
          selection
          options={options}
          defaultValue={defaultValue}
          onChange={(e, { value}) => {
            onChange(value);
            afterChange?.(value);
          }}
          disabled={disabled}
          error={!!errors?.[name] && {
            content: errors[name].message,
            pointing: 'above',
          }}
        />
      )}
    />
  );
};


