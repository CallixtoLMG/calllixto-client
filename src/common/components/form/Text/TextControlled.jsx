
import { forwardRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextField } from "./TextField";

export const TextControlled = forwardRef(({
  name,
  width,
  rules,
  iconLabel,
  showPopup = false,
  popupContent = "",
  popupPosition,
  disabled,
  required,
  onKeyDown,
  onChange = value => value,
  ...inputParams
}, ref) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange: onFormChange, ...rest } }) => (
        <TextField
          {...rest}
          {...inputParams}
          name={name}
          width={width}
          ref={ref}
          onKeyDown={onKeyDown}
          required={required}
          disabled={disabled}
          showPopup={showPopup}
          popupContent={popupContent}
          popupPosition={popupPosition}
          iconLabel={iconLabel}
          error={!!errors?.[name] && {
            content: errors[name].message,
            pointing: 'above',
          }}
          onChange={(e) => {
            const value = onChange(e.target.value);
            onFormChange(value);
          }}
        />
      )}
    />
  );
});

TextControlled.displayName = 'TextControlled';
