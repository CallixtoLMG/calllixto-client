import { FormField, Input } from "@/common/components/custom";

export const ContentField = ({
  flex,
  width,
  label,
  value,
  error,
  disabled,
  onChange,
  onKeyPress,
  maxLength,
  extraContent,
}) => {
  return (
    <FormField flex={flex} width={width} label={label} control={Input} error={error}>
      <Input
        placeholder={label}
        value={value}
        disabled={disabled}
        onChange={onChange}
        maxLength={maxLength}
        onKeyPress={onKeyPress}
        icon={extraContent || null}
        iconPosition="right"
      />
    </FormField>
  );
};
