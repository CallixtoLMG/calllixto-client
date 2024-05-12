import CurrencyFormat from 'react-currency-format';
import styled from "styled-components";

export const CurrencyFormatInput = styled(CurrencyFormat)`
  box-shadow: ${({ shadow }) => shadow && " 0 1px 2px 0 rgba(34,36,38,.15)!important"};
  width: ${({ width }) => width && `${width}!important`};
  height: ${({ height = '30px' }) => height} !important;
  align-items: center;
  align-content: center;
  margin-top: ${({ marginTop }) => `${marginTop}!important`}
`;