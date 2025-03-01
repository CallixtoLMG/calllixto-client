import { FormField, TextArea } from "@/common/components/custom";

export const TextAreaField = ({
  width,
  label,
  placeholder,
  value,
  disabled,
  onChange,
  error
}) => {
  return (
    <FormField
      control={TextArea}
      label={label}
      width={width}
      placeholder={placeholder ?? label}
      value={value}
      readOnly={disabled}
      onChange={onChange}
      error={error}
    />
  );
};
