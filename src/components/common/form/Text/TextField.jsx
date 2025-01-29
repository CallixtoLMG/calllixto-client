import { FormField, Input, Label } from "@/components/common/custom";

export const TextField = ({
  flex,
  width,
  label,
  placeholder,
  iconLabel,
  value,
  disabled = true,
  onChange,
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
        readOnly={disabled}
        onChange={onChange}
      >
        {iconLabel && <Label width="fit-content" height="100%">{iconLabel}</Label>}
        <input />
      </Input>
    </FormField>
  );
};
