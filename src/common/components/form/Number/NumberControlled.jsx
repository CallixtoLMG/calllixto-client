import { Flex, FormField, Icon, Input } from "@/common/components/custom";
import { get } from "lodash";
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
  isMeasure = false,
  padding,
  ...inputProps
}) => {
  const { formState: { errors } } = useFormContext();
  const fieldError = get(errors, name);

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange: onChangeController, value, ...rest } }) => {
        const safeValue =
          value !== undefined && value !== null
            ? value
            : defaultValueFallback !== undefined
              ? defaultValueFallback
              : '';

        return (
          <FormField
            disabled={disabled}
            flex={flex}
            $width={width}
            label={label}
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
              padding={padding}
              maxLength={maxLength}
              value={safeValue}
              placeholder={placeholder ?? label}
              {...(unit && { iconPosition })}
              onChange={(e) => {
                let newValue = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');

                if (isMeasure) {
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
              
                if (isMeasure) {
                  if (!value || value === 0) {
                    onChangeController("0.1");
                  }
                } else {
                  if (!value || isNaN(value)) {
                    onChangeController("0");
                  }
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
      }}
    />
  );
};
