import es from "date-fns/locale/es";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
registerLocale("es", es);

export const DatePicker = ({
  selected,
  onChange,
  placeholder = "Selecciona una fecha",
  dateFormat = "dd-MM-yyyy",
  showTimeSelect = false,
  locale = "es",
  minDate,
  maxDate,
  disabled = false,
  showIcon,
  icon
}) => {
  return (
    <ReactDatePicker
      icon={icon}
      showIcon={showIcon}
      selected={selected}
      onChange={onChange}
      dateFormat={dateFormat}
      locale={locale}
      showTimeSelect={showTimeSelect}
      placeholderText={placeholder}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
    />
  );
};
