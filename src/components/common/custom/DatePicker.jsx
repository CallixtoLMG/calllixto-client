import { getDay } from "date-fns";
import es from "date-fns/locale/es";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";
registerLocale("es", es);

export const StyledDatePickerInput = styled.input`
  box-shadow: ${({ $shadow }) => $shadow && "0 1px 2px 0 rgba(34,36,38,.15)!important"};
  width: ${({ width }) => width || "100%"};
  height: ${({ height = "30px" }) => height} !important;
  text-align: ${({ textAlignLast }) => textAlignLast || "left"} !important;
  padding: 5px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  opacity: ${({ disabled }) => (disabled ? "0.3" : "1")};

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #85b7d9;
  }
`;

const DatePicker = ({
  selected,
  onChange,
  placeholder = "Selecciona una fecha",
  dateFormat = "dd-MM-yyyy",
  showTimeSelect = false,
  locale = "es",
  minDate,
  maxDate,
  disabled = false,
  excludedDays = []
}) => {

  const isAllowedDate = (date) => {
    const day = getDay(date);
    return !excludedDays.includes(day);
  };
  return (

    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      dateFormat={dateFormat}
      locale={locale}
      filterDate={isAllowedDate}
      showTimeSelect={showTimeSelect}
      placeholderText={placeholder}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      customInput={
        <StyledDatePickerInput
          $shadow
          height="50px"
          textAlignLast="center"
          placeholder="Selecciona una fecha"
        />
      }
    />
  );
};

export default DatePicker;
