import es from "date-fns/locale/es";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
registerLocale("es", es);

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
  showMonthDropdown,
  showYearDropdown
}) => {

  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      dateFormat={dateFormat}
      locale={locale}
      showTimeSelect={showTimeSelect}
      placeholderText={placeholder}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      showMonthDropdown={showMonthDropdown}
      showYearDropdown={showYearDropdown}
    />
  );
};

export default DatePicker;
