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
  optionsMapper
}) => {
  const { formState: { errors } } = useFormContext();

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ...rest } }) => {
        const normalizedValue = Array.isArray(value)
          ? value.map(v => (typeof v === "object" ? v.name : v))
          : [];

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
            // renderLabel={renderLabel}
            renderLabel={(item) => {
              const tagName = typeof item === "object" ? item.value : item;

              return {
                color: optionsMapper[tagName]?.color || "grey",
                content: optionsMapper[tagName]?.name || tagName,
              };
            }}
            noResultsMessage="No se encontraron resultados"
            clearable={clearable}
            options={options}
            defaultValue={defaultValue}
            // value={value.name}
            value={normalizedValue}
            // onChange={(e, { value }) => {
            //   console.log({ value, options, optionsMapper })
            //   if (optionsMapper) {
            //     onChange(value.map((v) => optionsMapper[v]));
            //     afterChange?.(value);
            //   } else {
            //     onChange(value);
            //     afterChange?.(value);
            //   }
            // }}
            onChange={(e, { value }) => {

              const newValue = value.map(v => (optionsMapper[v] ? v : v.name)); // 🔥 Convertimos a string

              onChange(newValue);
              afterChange?.(newValue);
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
