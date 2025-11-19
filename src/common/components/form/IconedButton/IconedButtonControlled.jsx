import { FormField } from "@/common/components/custom";
import { forwardRef } from "react";
import { Controller } from "react-hook-form";
import { IconedButton } from "../../buttons";

  export const IconedButtonControlled = forwardRef(({
  width,
  name,
  icon,
  label,
  text,
  disabled,
  color,
}, ref) => {
  return (
    <Controller
      name={name}
      render={({ field: { value, onChange, ...rest } }) => (
        <FormField
          {...rest}
          $width={width}
          $height="38px"
          label={label}
          text={text}
          icon={icon}
          control={IconedButton}
          onClick={() => onChange(!value)}
          basic={!value}
          disabled={disabled}
          color={color}
          ref={ref}
        />
      )}
    />
  );
});

IconedButtonControlled.displayName = 'IconedButtonControlled';