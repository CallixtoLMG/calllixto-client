import { FormField, Input } from "@/common/components/custom";
import { useEffect, useRef, useState } from "react";
import { Icon } from "semantic-ui-react";

// Función para formatear con separadores de miles
const formatNumberWithThousands = (value) => {
  const [integer, decimal] = value.split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
};

// Función para obtener la cantidad de separadores de miles en un valor
const getThousandSeparatorCount = (value) => (value.match(/,/g) || []).length;

export const PriceField = ({
  error,
  label,
  width,
  value = '',
  onChange,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const [internalValue, setInternalValue] = useState(value.toString());

  // Sincronizar internalValue con el valor externo cuando cambie
  useEffect(() => {
    setInternalValue(formatNumberWithThousands(value.toString()));
  }, [value]);

  const handleChange = (e) => {
    const inputElement = e.target;
    const cursorPosition = inputElement.selectionStart;

    let inputValue = e.target.value;

    // Eliminar caracteres no válidos
    inputValue = inputValue.replace(/[^0-9.]/g, '');

    // Asegurar solo un punto decimal
    const normalizedValue = inputValue.split('.').reduce((acc, part, index) => {
      return index === 0 ? part : `${acc}.${part}`;
    });

    // Restringir a 2 decimales como máximo
    const [integerPart, decimalPart = ''] = normalizedValue.split('.');
    const trimmedValue = decimalPart.length > 2
      ? `${integerPart}.${decimalPart.slice(0, 2)}`
      : normalizedValue;

    // Obtener el número de separadores antes y después de formatear
    const separatorCountBefore = getThousandSeparatorCount(internalValue);
    const formattedValue = formatNumberWithThousands(trimmedValue);
    const separatorCountAfter = getThousandSeparatorCount(formattedValue);

    // Calcular el ajuste en la posición del cursor
    const cursorAdjustment = separatorCountAfter - separatorCountBefore;

    setInternalValue(formattedValue);
    onChange(parseFloat(trimmedValue) || 0);

    // Restaurar la posición del cursor con el ajuste
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
      >
        <Icon name="dollar" />
        <input />
      </Input>
    </FormField>
  );
};
