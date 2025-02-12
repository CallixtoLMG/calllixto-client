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
  clearable,
  search,
  pickErrors,
  multiple,
  renderLabel // VER ESTO
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
          search={search}
          selection
          renderLabel={renderLabel}
          multiple={multiple}
          noResultsMessage="No se encontraron resultados"
          clearable={clearable}
          options={options}
          defaultValue={defaultValue}
          onChange={(e, { value }) => {
            onChange(value);
            afterChange?.(value);
          }}
          disabled={disabled}
          error={errors?.[name] && (pickErrors ? pickErrors.includes(errors[name]?.type) : true) && {
            content: errors[name]?.message,
            pointing: 'above',
          }}
        />
      )}
    />
  );
};
