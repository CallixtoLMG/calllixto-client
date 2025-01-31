import { FormField } from "@/components/common/custom";
import { Controller } from "react-hook-form";
import { IconedButton } from "../../buttons";

export const IconedButtonControlled = ({
  width,
  name,
  icon,
  label,
  disabled,
}) => {
  return (
    <Controller
      name={name}
      render={({ field: { value, onChange, ...rest } }) => (
        <FormField width={width}>
          <IconedButton
            {...rest}
            height="38px"
            text={label}
            icon={icon}
            onClick={() => onChange(!value)}
            basic={!value}
            disabled={disabled}
          />
        </FormField>
      )}
    />
  );
};
