import { Flex, FormField, Icon, Input } from "@/common/components/custom";
import { Header } from "semantic-ui-react";

export const NumberField = ({
  value,
  width,
  flex,
  label,
  unit,
  iconPosition,
  placeholder,
  onChange,
  maxLength,
  justifyItems,
  disabled,
  defaultValue = 0,
  allowsDecimal = false,
  padding,
  required,
  onKeyDown,
  error,
  ...inputProps
}) => {
  return (
    <FormField
      disabled={disabled}
      flex={flex}
      $width={width}
      label={label}
      required={required}
      control={Input}
      error={error}
    >
      <Input
        {...inputProps}
        icon
        onKeyDown={onKeyDown}
        padding={padding}
        maxLength={maxLength}
        value={value}
        placeholder={placeholder ?? label}
        {...(unit && { iconPosition })}
        onChange={(e) => {
          let newValue = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');

          if (allowsDecimal) {
            if (/^\d*\.?\d{0,2}$/.test(newValue)) {
              onChange?.(newValue);
            }
          } else {
            newValue = newValue.replace(/\..*/, '');
            onChange?.(newValue);
          }
        }}
        onBlur={(e) => {
          const raw = e.target.value.replace(',', '.');
          const value = parseFloat(raw);
          if (!value || isNaN(value)) {
            onChange?.(String(defaultValue));
          }
        }}
        onFocus={(e) => e.target.select()}
      >
        {unit && (
          <Icon justifyItems={justifyItems}>
            <Flex height="100%" $alignItems="center">
              <Header as="h5">{unit}</Header>
            </Flex>
          </Icon>
        )}
        <input />
      </Input>
    </FormField>
  );
};
