import { FormField, Input } from "@/common/components/custom";
import { getNumberFormated } from "@/common/utils";
import { useEffect, useState } from "react";
import { Icon } from "semantic-ui-react";

export const PriceField = ({
  error,
  label,
  width,
  value = '',
  updateFromParent,
  onChange,
  disabled = false,
  placeholder,
  justifyItems
}) => {
  const [formattedValue, setFormattedValue] = useState(getNumberFormated(value ?? 0)[0]);

  const handleChange = (event) => {
    const [asString, asNumber] = getNumberFormated(event.target.value);
    setFormattedValue(asString);
    onChange(asNumber);
  };

  useEffect(() => {
    setFormattedValue(getNumberFormated(value ?? 0)[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateFromParent]);

  return (
    <FormField
      disabled={disabled}
      label={label}
      $width={width}
      control={Input}
      error={error}
    >
      <Input
        value={formattedValue}
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
