import { Flex, FormField, Icon, Input } from "@/common/components/custom";
import { get, isNil } from "lodash";
import { Controller, useFormContext } from "react-hook-form";
import { Header } from "semantic-ui-react";

export const NumberControlled = ({
  width,
  flex,
  name,
  rules,
  label,
  unit,
  iconPosition,
  placeholder,
  onChange,
  maxLength,
  justifyItems,
  normalMode = false,
  disabled,
  defaultValueFallback,
  defaultValue = 0,
  allowsDecimal = false,
  padding,
  required,
  onKeyDown,
  ...inputProps
}) => {
  const { formState: { errors } } = useFormContext();
  const fieldError = get(errors, name);

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange: onChangeController, value, ...rest } }) => {
        const safeValue = !isNil(value) ? value : defaultValueFallback ?? '';

        return (
          <FormField
            disabled={disabled}
            flex={flex}
            $width={width}
            label={label}
            required={required}
            control={Input}
            error={fieldError && {
              content: fieldError.message,
              pointing: "above",
            }}
          >
            <Input
              {...inputProps}
              {...rest}
              icon
              onKeyDown={onKeyDown}
              padding={padding}
              maxLength={maxLength}
              value={safeValue}
              placeholder={placeholder ?? label}
              {...(unit && { iconPosition })}
              onChange={(e) => {
                let newValue = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');

                if (allowsDecimal) {
                  if (/^\d*\.?\d{0,2}$/.test(newValue)) {
                    onChangeController(newValue);
                    onChange?.(newValue);
                  }
                } else {
                  newValue = newValue.replace(/\..*/, '');
                  onChangeController(newValue);
                  onChange?.(newValue);
                }
              }}
              onBlur={(e) => {
                const raw = e.target.value.replace(',', '.');
                const value = parseFloat(raw);
                if (!value || isNaN(value)) {
                  onChangeController(String(defaultValue));
                  onChange?.(String(defaultValue));
                }
              }}
              onFocus={(e) => e.target.select()}
            >
              {unit && (
                <Icon justifyItems={justifyItems}>
                  <Flex $paddingRight="14px" height="100%" $alignItems="center">
                    <Header as="h5">{unit}</Header>
                  </Flex>
                </Icon>
              )}
              <input />
            </Input>
          </FormField>
        );
      }}
    />
  );
};
