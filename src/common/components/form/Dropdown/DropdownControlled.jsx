import { Controller, useFormContext } from "react-hook-form";
import { Dropdown } from "../../custom";

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
  renderLabel
}) => {
  const { formState: { errors } } = useFormContext();

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ...rest } }) => {
        console.log("🟢 [DropdownControlled] name:", name);
        console.log("🟢 [DropdownControlled] value (seleccionados):", value);
        console.log("🟢 [DropdownControlled] options (disponibles):", options);

        // 🔥 Aseguramos que `value` sea un array de strings (JSON) que coincida con `options`
        const parsedValue = Array.isArray(value) 
          ? value.map(tag => (typeof tag === "string" ? tag : JSON.stringify(tag))) 
          : [];

        return (
          <Dropdown
            {...rest}
            value={parsedValue} // ✅ El valor ahora coincide con `options`
            height={height}
            width={width}
            loading={loading}
            label={label}
            placeholder={placeholder ?? label}
            search={search}
            selection
            multiple={multiple}
            renderLabel={renderLabel}
            noResultsMessage="No se encontraron resultados"
            clearable={clearable}
            options={options}
            defaultValue={defaultValue}
            onChange={(e, { value }) => {
              console.log("✅ [DropdownControlled] Nuevo valor seleccionado:", value);

              // 🔥 Convertimos de JSON a objeto si es un string
              const selectedTags = value.map(item => (typeof item === "string" ? JSON.parse(item) : item));
              console.log("✅ [DropdownControlled] selectedTags después de parsear:", selectedTags);

              onChange(selectedTags);
              afterChange?.(selectedTags);
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
