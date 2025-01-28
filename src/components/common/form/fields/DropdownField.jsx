import { FormField, Dropdown } from "@/components/common/custom";

export const DropdownField = ({
  width,
  required,
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  error
}) => {
  return (
    <FormField
      width={width}
      required={required}
      label={label}
      placeholder={placeholder ?? label}
      search
      selection
      minCharacters={2}
      noResultsMessage="Sin resultados!"
      options={options}
      clearable
      value={value}
      onChange={onChange}
      disabled={disabled}
      control={Dropdown}
      error={error}
    />
  );
};
