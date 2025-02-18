import { Controller, useFormContext } from "react-hook-form";
import { Dropdown, FormField } from "../../custom";

export const DropdownControlled = ({
  name,
  width,
  height,
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
  loading,
  renderLabel,
}) => {
  const { formState: { errors } } = useFormContext();

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ...rest } }) => {
        return (
          <FormField
            {...rest}
            height={height}
            width={width}
            loading={loading}
            label={label}
            placeholder={placeholder ?? label}
            search={search}
            selection
            control={Dropdown}
            multiple={multiple}
            renderLabel={renderLabel}
            noResultsMessage="No se encontraron resultados"
            clearable={clearable}
            options={options}
            defaultValue={defaultValue}
            value={value?.name}
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
        );
      }}
    />
  );
};
