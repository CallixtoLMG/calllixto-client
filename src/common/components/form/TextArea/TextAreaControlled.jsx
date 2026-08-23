import { Controller, useFormContext } from "react-hook-form";
import { TextAreaField } from "./TextAreaField";

export const TextAreaControlled = ({ name, rules, dataTestId = `textarea-${name}`, ...inputParams }) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field }) => (
        <TextAreaField
          {...field}
          {...inputParams}
          dataTestId={dataTestId}
          error={!!errors?.[name] && {
            content: errors[name].message,
            pointing: 'above',
          }}
        />
      )}
    />
  );
};
