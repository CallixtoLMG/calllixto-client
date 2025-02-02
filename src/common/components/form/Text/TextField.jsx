import { FormField, Input, Label } from "@/common/components/custom";

export const TextField = ({
  flex,
  width,
  label,
  placeholder,
  iconLabel,
  value,
  disabled,
  onChange,
  onKeyPress,
  maxLength,
  error
}) => {
  return (
    <FormField
      flex={flex}
      width={width}
      label={label}
      control={Input}
      error={error}
    >
      <Input
        placeholder={placeholder ?? label}
        {...(iconLabel && { labelPosition: 'left' })}
        value={value}
        disabled={disabled}
        onChange={onChange}
        maxLength={maxLength}
        onKeyPress={onKeyPress}
      >
        {iconLabel && <Label width="fit-content" height="100%">{iconLabel}</Label>}
        <input />
      </Input>
    </FormField>
  );
};
