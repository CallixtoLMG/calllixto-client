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
  iconPosition = 'left',
  placeholder,
  onChange,
  maxLength,
  justifyItems,
  normalMode = false,
  disabled,
  defaultValueFallback,
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
            width={width}
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
              maxLength={maxLength}
              value={normalMode
                ? safeValue
                : (typeof safeValue === 'number'
                    ? safeValue.toLocaleString()
                    : safeValue)
              }
              placeholder={placeholder ?? label}
              {...(unit && { iconPosition })}
              onChange={(e) => {
                let newValue = e.target.value.replace(/[^0-9]/g, '');

                if (!normalMode) {
                  newValue = newValue ? Number(newValue).toLocaleString() : '';
                }

                onChangeController(newValue);
                onChange?.(newValue);
              }}
              onFocus={(e) => e.target.select()}
            >
              {unit && (
                <Icon justifyItems={justifyItems}>
                  <Flex height="100%" alignItems="center">
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
