
import { PASSWORD_REQUIREMENTS } from "@/common/constants";
import { forwardRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FlexColumn } from "../../custom";
import { PasswordRequirements } from "../PasswordRequirements";
import PasswordField from "./PasswordField";

export const PasswordControlled = forwardRef(({
  name,
  showPasswordRequirements,
  rules,
  ...inputParams
}, ref) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { value, ...rest } }) => (
        <FlexColumn $rowGap="15px" >
          <PasswordField
            {...rest}
            ref={ref}
            {...inputParams}
            value={value}
            error={!!errors?.[name] && {
              content: errors[name].message,
              pointing: 'above',
            }}
          />
          {showPasswordRequirements && (
            <PasswordRequirements
              requirements={PASSWORD_REQUIREMENTS}
              password={value}
            />
          )}
        </FlexColumn>
      )}
    />
  );
});

PasswordControlled.displayName = 'PasswordControlled';
