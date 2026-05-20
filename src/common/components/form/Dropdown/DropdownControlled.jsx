import { Controller, useFormContext } from "react-hook-form";
import { forwardRef } from "react";
import { Dropdown, FormField } from "../../custom";

const DropdownControl = forwardRef(({ dropdownMinWidth, ...props }, ref) => (
  <Dropdown {...props} ref={ref} $minWidth={dropdownMinWidth} />
));

DropdownControl.displayName = "DropdownControl";

export const DropdownControlled = ({
  name,
  width,
  height,
  label,
  rules,
  placeholder,
  options = [],
  afterChange,
  disabled,
  clearable,
  search,
  pickErrors,
  multiple,
  loading,
  optionsMapper,
  required,
  icon,
  textMaxWidth,
  minWidth,
  maxWidth
}) => {
  const { formState: { errors } } = useFormContext();

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ...rest } }) => {
        const normalizedValue = Array.isArray(value)
          ? value.map(v => (typeof v === "object" ? v?.name : v))
          : value;
        return (
          <FormField
            {...rest}
            icon={icon}
            height={height}
            $width={width}
            $maxWidth={maxWidth}
            $textMaxWidth={textMaxWidth}
            loading={loading}
            label={label}
            placeholder={placeholder ?? label}
            search={search}
            required={required}
            selection
            control={DropdownControl}
            dropdownMinWidth={minWidth}
            multiple={multiple}
            renderLabel={(item) => {
              if (typeof item === "string") return item;

              const mappedItem = optionsMapper?.[item.value];

              return mappedItem
                ? {
                  color: mappedItem.color,
                  content: mappedItem.name,
                }
                : {
                  content: item.text || item.value,
                };
            }}
            noResultsMessage="No se encontraron resultados"
            clearable={clearable}
            options={options}
            value={normalizedValue}
            onChange={(e, { value }) => {
              if (optionsMapper) {
                const values = value.map((v) => optionsMapper[v])
                onChange(values);
                afterChange?.(values);
                return;
              }
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
