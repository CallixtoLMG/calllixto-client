import CurrencyFormat from 'react-currency-format';
import { Flex } from "rebass";
import styled from "styled-components";

export const CurrencyFormatInput = styled(CurrencyFormat)`
  box-shadow: ${({ $shadow }) => $shadow && " 0 1px 2px 0 rgba(34,36,38,.15)!important"};
  width: ${({ width }) => width && `${width}!important`};
  height: ${({ height = '30px' }) => height} !important;
  align-items: center;
  align-content: center;
  text-align-last: ${({ textAlignLast }) => textAlignLast} !important;
  margin-top: ${({ marginTop }) => `${marginTop}!important`};
  margin: ${({ $marginBottom }) => $marginBottom & "5px 0"} !important;
`;

export const Price = ({ value }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      $
      <CurrencyFormatInput
        displayType="text"
        thousandSeparator={true}
        fixedDecimalScale={true}
        decimalScale={2}
        value={value}
      />
    </Flex>
  )
}
