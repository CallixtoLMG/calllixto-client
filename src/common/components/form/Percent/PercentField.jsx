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
  maxValue = 100,
  disabled
}) => {

  return (
    <FormField
      flex={flex}
      width={width}
      height={height}
      label={label}
      control={Input}
      disabled={disabled}
      error={error}
    >
      <Input
        value={value}
        disabled={disabled}
        iconPosition="right"
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
      >
        <Icon name={ICONS.PERCENT} size='small' />
        <input />
      </Input>
    </FormField>
  );
}