
import { Controller, useFormContext } from "react-hook-form";
import { TextField } from "./TextField";

export const TextControlled = ({
  name,
  rules,
  iconLabel,
  showPopup = false, 
  popupContent = "", 
  popupPosition,
  disabled,
  onChange = value => value,
  ...inputParams
}) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange: onFormChange, ...rest } }) => (
        <TextField
          {...rest}
          {...inputParams}
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
};


