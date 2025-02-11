import { FormField, Input } from "@/common/components/custom";
import { useEffect, useRef, useState } from "react";
import { Icon } from "semantic-ui-react";

const formatNumberWithThousands = (value) => {
  const [integer, decimal] = value.split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
};

const getThousandSeparatorCount = (value) => (value.match(/,/g) || []).length;

export const PriceField = ({
  error,
  label,
  width,
  value = '',
  onChange,
  disabled = false,
  placeholder
}) => {
  const inputRef = useRef(null);
  const [internalValue, setInternalValue] = useState(value.toString());

  useEffect(() => {
    setInternalValue(formatNumberWithThousands(value.toString()));
  }, [value]);

  const handleChange = (e) => {
    const inputElement = e.target;
    const cursorPosition = inputElement.selectionStart;

    let inputValue = e.target.value;

    inputValue = inputValue.replace(/[^0-9.]/g, '');

    const normalizedValue = inputValue.split('.').reduce((acc, part, index) => {
      return index === 0 ? part : `${acc}.${part}`;
    });

    const [integerPart, decimalPart = ''] = normalizedValue.split('.');
    const trimmedValue = decimalPart.length > 2
      ? `${integerPart}.${decimalPart.slice(0, 2)}`
      : normalizedValue;

    const separatorCountBefore = getThousandSeparatorCount(internalValue);
    const formattedValue = formatNumberWithThousands(trimmedValue);
    const separatorCountAfter = getThousandSeparatorCount(formattedValue);

    const cursorAdjustment = separatorCountAfter - separatorCountBefore;

    setInternalValue(formattedValue);
    onChange(parseFloat(trimmedValue) || 0);

    window.requestAnimationFrame(() => {
      inputElement.setSelectionRange(cursorPosition + cursorAdjustment, cursorPosition + cursorAdjustment);
    });
  };

  return (
    <FormField label={label} width={width} control={Input} error={error}>
      <Input
        ref={inputRef}
        value={internalValue}
        onChange={handleChange}
        disabled={disabled}
        iconPosition="left"
        placeholder={placeholder}
      >
        <Icon name="dollar" />
        <input />
      </Input>
    </FormField>
  );
};
