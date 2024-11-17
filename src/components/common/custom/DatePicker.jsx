import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";

export const DateSelector = styled(DatePicker)`
  padding: ${({ padding }) => `${padding}!important`};
  min-width: ${({ minWidth }) => `${minWidth}!important;`};
  max-width: ${({ $maxWidth }) => $maxWidth && `200px!important;`};
  margin: ${({ margin }) => `${margin}!important;`};
  box-shadow: ${({ hideBorder }) => hideBorder ? "none" : "0 1px 2px 0 rgba(34,36,38,.15) !important"};
  border-radius: ${({ hideBorder }) => hideBorder ? "0" : "0.28571429rem !important"};
  background-color: ${({ bgColor }) => `${bgColor}!important`};
  height: ${({ height = "50px" }) => `${height}!important`};
  min-height: ${({ minHeight }) => `${minHeight}!important`};
  display: flex!important;
  flex-wrap: wrap;
  align-content: center;
  width: ${({ width = "100%" }) => `${width}!important`};
`;
