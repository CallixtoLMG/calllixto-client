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
  disabled,
  justifyItems,
  onBlur,
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
        justifyItems={justifyItems}
        disabled={disabled}
        onChange={(e) => {
          const inputValue = e.target.value;

          if (inputValue === '') {
            onChange('');
            return;
          }

          const regex = /^\d*\.?\d{0,2}$/;

          if (regex.test(inputValue)) {
            const numericValue = parseFloat(inputValue);
            if (numericValue <= maxValue && numericValue >= 0) {
              onChange(inputValue);
            }
          }
        }}
        onFocus={(e) => e.target.select()}
        onBlur={onBlur}
        ref={ref}
      >
        <input />
        <Icon name={ICONS.PERCENT} size='small' />
      </Input>
    </FormField>
  );
})

PercentField.displayName = 'PercentField';