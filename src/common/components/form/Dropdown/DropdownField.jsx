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
  clearable
}) => {
  return (
    <FormField
      flex={flex}
      width={width}
      required={required}
      label={label}
      placeholder={placeholder ?? label}
      search
      selection
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
