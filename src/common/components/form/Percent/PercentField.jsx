import { FormField, Icon, Input } from "@/common/components/custom";
import { ICONS } from "@/common/constants";

export const PercentField = ({
  flex,
  width,
  height,
  label,
  value,
  onChange,
  error,
  largeValue,
  disabled
}) => {

  const maxValue = largeValue ? 1000000 : 100;

  return (
    <FormField
      flex={flex}
      width={width}
      height={height}
      label={label}
      control={Input}
      error={error}
    >
      <Input
        value={value}
        disabled={disabled}
        iconPosition="right"
        onChange={(e) => {
          const value = e.target.value;
          if (!isNaN(value) && value <= maxValue && value >= 0) {
            onChange(Number(value));
          }
        }}
        onFocus={(e) => e.target.select()}
      >
        <Icon name={ICONS.PERCENT} size='small' />
        <input />
      </Input>
    </FormField>
  );
}