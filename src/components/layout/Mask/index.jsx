import { CurrencyInput } from "react-currency-mask";

const Mask = ({ value, field, inputElement }) => {
  value = value || field.value;
  return (
    <CurrencyInput
      value={value}
      locale="es-AR"
      currency="ARS"
      onChangeValue={(_, maskedValue) => {
        field.onChange(maskedValue);
      }}
      InputElement={inputElement}
    />
  );
};
export default Mask;
