import { FormField, Icon, Input } from "@/components/common/custom";
import { ICONS } from "@/constants";

export const PercentField = ({
  flex,
  width,
  height,
  label,
  value,
  onChange,
  error
}) => {
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
        iconPosition="right"
        onChange={(e) => {
          const value = e.target.value;
          if (!isNaN(value) && value <= 100 && value >= 0) {
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