
import { PASSWORD_REQUIREMENTS } from "@/common/constants";
import { forwardRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { PasswordRequirements } from "../PasswordRequirements";
import PasswordField from "./PasswordField";
import { Box } from "../../custom";

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
          <Box>
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
          </Box>
        )}
      />
  );
});

PasswordControlled.displayName = 'PasswordControlled';
