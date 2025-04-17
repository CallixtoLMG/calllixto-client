import { FormField, Icon, Input } from "@/common/components/custom";
import { ICONS } from "@/common/constants";
import { forwardRef } from "react";

export const PercentField = forwardRef(({
  flex,
  width,
  height,
  label,
  value,
  onChange,
  error,
  maxValue = 100,
  disabled
}, ref) => {

  return (
    <FormField
      flex={flex}
      $width={width}
      height={height}
      label={label}
      control={Input}
      disabled={disabled}
      error={error}
    >
      <Input
        value={value}
        icon
        disabled={disabled}
        onChange={(e) => {
          const value = e.target.value;
          if (!isNaN(value) && value <= maxValue && value >= 0) {
            onChange(Number(value));
          }
        }}
        onFocus={(e) => e.target.select()}
        ref={ref}
      >
        <input />
        <Icon name={ICONS.PERCENT} size='small' />
      </Input>
    </FormField>
  );
})

PercentField.displayName = 'PercentField';