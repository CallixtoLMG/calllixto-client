import { FormField } from "@/common/components/custom";
import { forwardRef } from "react";
import { Controller } from "react-hook-form";
import { IconedButton } from "../../buttons";

export const IconedButtonControlled = forwardRef(({
  width,
  height = "38px",
  name,
  icon,
  label,
  text,
  disabled,
  color,
  $maxWidth,
  minWidth,
  iconOnly,
  dataTestId,
}, ref) => {
  return (
    <Controller
      name={name}
      render={({ field: { value, onChange, ...rest } }) => (
        <FormField
          {...rest}
          $maxWidth={$maxWidth}
          $width={width}
          $minWidth={minWidth}
          height={height}
          width={width}
          minWidth={minWidth}
          label={label}
          text={text}
          icon={icon}
          iconOnly={iconOnly}
          control={IconedButton}
          onClick={() => onChange(!value)}
          basic={!value}
          disabled={disabled}
          color={color}
          dataTestId={dataTestId}
          ref={ref}
        />
      )}
    />
  );
});

IconedButtonControlled.displayName = 'IconedButtonControlled';
