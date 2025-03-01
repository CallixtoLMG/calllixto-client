
import { PASSWORD_REQUIREMENTS } from "@/common/constants";
import { Controller, useFormContext } from "react-hook-form";
import PasswordField from "./PasswordField";
import { PasswordRequirements } from "../PasswordRequirements";

export const PasswordControlled = ({
  name,
  showPasswordRequirements,
  rules,
  ...inputParams
}) => {
  const { formState: { errors } } = useFormContext();
  return (
    <>

      <Controller
        name={name}
        rules={rules}
        render={({ field: { value, ...rest } }) => (
          <>
            <PasswordField
              {...rest}
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
          </>
        )}
      />
    </>
  );
};


