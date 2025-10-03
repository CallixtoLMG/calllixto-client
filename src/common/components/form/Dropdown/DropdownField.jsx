import { Dropdown, FormField } from "@/common/components/custom";

export const DropdownField = ({
  flex,
  width,
  required,
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  error,
  clearable,
  multiple,
  search,
  selection,
  height = "38px"
}) => {

  return (
    <FormField
      flex={flex}
      $width={width}
      height={height}
      required={required}
      label={label}
      placeholder={placeholder ?? label}
      search={search}
      multiple={multiple}
      selection={selection}
      minCharacters={2}
      noResultsMessage="Sin resultados!"
      options={options}
      clearable={clearable}
      value={value}
      onChange={onChange}
      disabled={disabled}
      control={Dropdown}
      error={error}
    />
  );
};
