import { FormField, Input } from "@/common/components/custom";
import { getNumberFormated } from "@/common/utils";
import { useRef, useState } from "react";
import { Icon } from "semantic-ui-react";

export const PriceField = ({
  error,
  label,
  width,
  value = '',
  onChange,
  disabled = false,
  placeholder,
  onKeyDown,
  justifyItems
}) => {
  const isUserTyping = useRef(false);
  const [formattedValue, setFormattedValue] = useState(getNumberFormated(value ?? 0)[0]);

  const handleChange = (event) => {
    const [asString, asNumber] = getNumberFormated(event.target.value);
    isUserTyping.current = true;
    setFormattedValue(asString);
    onChange(asNumber);
  };

  const [expectedFormatted] = getNumberFormated(value ?? 0);
  if (!isUserTyping.current && formattedValue !== expectedFormatted) {
    setFormattedValue(expectedFormatted);
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
        value={formattedValue}
        onChange={handleChange}
        onBlur={() => { isUserTyping.current = false; }}
        disabled={disabled}
        iconPosition="left"
        placeholder={placeholder}
        justifyItems={justifyItems}
        onKeyDown={onKeyDown}
      >
        <Icon name="dollar" />
        <input />
      </Input>
    </FormField>
  );
};
