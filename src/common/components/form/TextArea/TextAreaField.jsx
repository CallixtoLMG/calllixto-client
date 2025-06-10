import { FormField, TextArea } from "@/common/components/custom";
import { forwardRef } from "react";

export const TextAreaField = forwardRef(({
  width,
  label,
  placeholder,
  value,
  disabled,
  readOnly,
  onChange,
  error
}, ref) => {
  return (
    <FormField
      disabled={disabled}
      control={TextArea}
      label={label}
      width={width}
      placeholder={placeholder ?? label}
      value={value}
      readOnly={readOnly}
      onChange={onChange}
      error={error}
      ref={ref}
    />
  );
});

TextAreaField.displayName = 'TextAreaField';
