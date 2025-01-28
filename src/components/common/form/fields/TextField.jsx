import { FormField, Input, Label } from "@/components/common/custom";

export const TextField = ({ width, flex, label, iconLabel, disabled = true, onChange, placeholder, value }) => {
  return (
    <FormField
      flex={flex}
      width={width}
      label={label}
      control={Input}
    >
      <Input
        value={value}
        readOnly={disabled}
        onChange={onChange}
        {...(iconLabel && { labelPosition: 'left' })}
        placeholder={placeholder ?? label}
      >
        {iconLabel && <Label width="fit-content" height="100%">{iconLabel}</Label>}
        <input />
      </Input>
    </FormField>
  );
};
