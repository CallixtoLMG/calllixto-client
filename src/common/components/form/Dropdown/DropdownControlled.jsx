
import { FormField } from "@/common/components/custom";
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
  disabled,
  clearable
}) => {
  const { formState: { errors } } = useFormContext();
  const showError = errors?.[name]?.type === "required";
  const errorMessage = errors?.[name]?.message;
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
          clearable={clearable}
          options={options}
          defaultValue={defaultValue}
          onChange={(e, { value }) => {
            onChange(value);
            afterChange?.(value);
          }}
          disabled={disabled}
          error={showError && {
            content: errorMessage,
            pointing: 'above',
          }}
        />
      )}
    />
  );
};


