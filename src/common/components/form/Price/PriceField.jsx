import { FormField, Input } from "@/common/components/custom";
import { useState } from "react";
import { Icon } from "semantic-ui-react";

export const PriceField = ({
  error,
  label,
  width,
  value = '',
  onChange,
  disabled = false,
  placeholder,
  justifyItems
}) => {
  const [formatedValue, setFormatedValue] = useState(value);

  const handleChange = (event) => {
    const strNumber = event.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*?)\./g, "$1");

    let [integerPart, decimalPart] = strNumber.split(".");

    if (decimalPart !== undefined) {
      decimalPart = decimalPart.slice(0, 2);
    }

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formattedValue = decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;

    setFormatedValue(formattedValue);
    onChange(Number(`${integerPart}.${decimalPart || ""}`));
  };

  return (
    <FormField
      disabled={disabled}
      label={label}
      $width={width}
      control={Input}
      error={error}
    >
      <Input
        value={formatedValue}
        onChange={handleChange}
        disabled={disabled}
        iconPosition="left"
        placeholder={placeholder}
        justifyItems={justifyItems}
      >
        <Icon name="dollar" />
        <input />
      </Input>
    </FormField>
  );
};
