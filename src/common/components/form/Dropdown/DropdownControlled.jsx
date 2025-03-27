import { useTruncationPopupRenderer } from "@/hooks/useTruncationPopupRenderer";
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
  optionsMapper,
  icon
}) => {
  const { formState: { errors } } = useFormContext();

  const renderWithTruncation = useTruncationPopupRenderer({
    maxWidth: "150px", // Ajustá según tu diseño
    position: "top center"
  });

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ...rest } }) => {
        const normalizedValue = Array.isArray(value)
          ? value.map(v => (typeof v === "object" ? v.name : v))
          : value;

        return (
          <FormField
            {...rest}
            icon={icon}
            height={height}
            width={width}
            loading={loading}
            label={label}
            placeholder={placeholder ?? label}
            search={search}
            selection
            control={Dropdown}
            multiple={multiple}
            renderLabel={(item) => {
              const labelText = typeof item === "string"
                ? item
                : optionsMapper[item.value]?.name || "";

              const color = typeof item === "string"
                ? undefined
                : optionsMapper[item.value]?.color;

              return {
                color,
                content: renderWithTruncation(labelText),
              };
            }}
            noResultsMessage="No se encontraron resultados"
            clearable={clearable}
            options={options}
            defaultValue={defaultValue}
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
