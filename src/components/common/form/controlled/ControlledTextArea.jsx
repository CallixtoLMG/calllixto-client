import { Controller, useFormContext } from "react-hook-form";
import { TextAreaField } from "../fields/TextAreaField";

export const ControlledTextArea = ({ name, rules, ...inputParams }) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field }) => (
        <TextAreaField
          {...field}
          {...inputParams}
          error={!!errors?.[name] && {
            content: errors[name].message,
            pointing: 'above',
          }}
        />
      )}
    />
  );
};
