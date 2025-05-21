import { FormField, Input } from "@/common/components/custom";
import { useEffect, useRef, useState } from "react";
import { Icon } from "semantic-ui-react";

const formatNumberWithThousands = (value) => {
  const [integer, decimal] = value.split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
};

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
  const inputRef = useRef(null);
  const [internalValue, setInternalValue] = useState(value.toString());

  useEffect(() => {
    setInternalValue(formatNumberWithThousands(value.toString()));
  }, [value]);

  const handleChange = (e) => {
    const inputElement = e.target;
    const rawValue = e.target.value;
    const cursorPosition = inputElement.selectionStart;
  
    const unformatted = rawValue.replace(/[^0-9.]/g, '');
  
    const charsBeforeCursor = rawValue.slice(0, cursorPosition).replace(/[^0-9.]/g, '');
  
    const [integerPart, decimalPart = ''] = unformatted.split('.');
    const trimmedValue = decimalPart.length > 2
      ? `${integerPart}.${decimalPart.slice(0, 2)}`
      : unformatted;
  
    const formattedValue = formatNumberWithThousands(trimmedValue);
  
    let validCharCount = 0;
    let newCursorPosition = formattedValue.length;
  
    for (let i = 0; i < formattedValue.length; i++) {
      if (formattedValue[i].match(/[0-9.]/)) {
        validCharCount++;
      }
      if (validCharCount === charsBeforeCursor.length) {
        newCursorPosition = i + 1;
        break;
      }
    }
  
    setInternalValue(formattedValue);
    onChange(parseFloat(trimmedValue) || 0);
  
    window.requestAnimationFrame(() => {
      inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
    });
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
        ref={inputRef}
        value={internalValue}
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
