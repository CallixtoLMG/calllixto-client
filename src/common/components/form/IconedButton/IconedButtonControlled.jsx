import { FormField } from "@/common/components/custom";
import { forwardRef } from "react";
import { Controller } from "react-hook-form";
import { IconedButton } from "../../buttons";

  export const IconedButtonControlled = forwardRef(({
  width,
  name,
  icon,
  label,
  disabled,
  color,
}, ref) => {
  return (
    <Controller
      name={name}
      render={({ field: { value, onChange, ...rest } }) => (
        <FormField $width={width}>
          <IconedButton
            {...rest}
            height="38px"
            text={label}
            icon={icon}
            onClick={() => onChange(!value)}
            basic={!value}
            disabled={disabled}
            color={color}
            ref={ref}
          />
        </FormField>
      )}
    />
  );
});

IconedButtonControlled.displayName = 'IconedButtonControlled';