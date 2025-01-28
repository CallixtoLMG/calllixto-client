
import { Controller, useFormContext } from "react-hook-form";
import { TextField } from "../fields/TextField";

export const ControlledText = ({ name, rules, onChange, ...inputParams }) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange: onFormChange, ...rest } }) => (
        <TextField
          {...rest}
          {...inputParams}
          error={!!errors?.[name] && {
            content: errors[name].message,
            pointing: 'above',
          }}
          onChange={(e) => onFormChange(onChange(e.target.value))}
        />
      )}
    />
  );
};


