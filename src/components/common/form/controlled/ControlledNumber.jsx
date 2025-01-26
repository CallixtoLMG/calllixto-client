import { Flex, FormField, Input } from "@/components/common/custom";
import { Controller, useFormContext } from "react-hook-form";
import { Header, Icon } from "semantic-ui-react";

export const ControlledNumber = ({
  width,
  name,
  rules,
  label,
  price,
  unit,
  iconPosition = 'left',
  allowsDecimals,
  placeholder,
  onChange,
  ...inputProps
}) => {
  const { formState: { errors } } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange: onChangeController, value, ...rest } }) => (
        <FormField
          width={width}
          label={label}
          control={Input}
          error={errors?.[name] ? {
            content: errors[name].message,
            pointing: 'above',
          } : null}
        >
          <Input
            {...inputProps}
            {...rest}
            value={value?.toLocaleString() ?? 0}
            placeholder={placeholder ?? label}
            iconPosition={iconPosition}
            onChange={(e) => {
              let newValue = e.target.value.replace(/[^0-9.]/g, '');
              if (!isNaN(newValue)) {
                newValue = Number(newValue);
                onChangeController(newValue);
                onChange?.(newValue);
              }
            }}
            onFocus={(e) => e.target.select()}
          >
            {price && <Icon name='dollar' />}
            {unit && (
              <Icon>
                <Flex height="100%" alignItems="center">
                  <Header as="h5">{unit}</Header>
                </Flex>
              </Icon>
            )}
            <input />
          </Input>
        </FormField>
      )}
    />
  );
};
