import { Icon } from "@/components/common/custom";
import CurrencyFormat from 'react-currency-format';
import styled from "styled-components";
import { Flex } from './Flex';

export const CurrencyFormatInput = styled(CurrencyFormat)`
  box-shadow: ${({ $shadow }) => $shadow && " 0 1px 2px 0 rgba(34,36,38,.15)!important"};
  width: ${({ width }) => width && `${width}!important`};
  height: ${({ height = '30px' }) => height} !important;
  align-items: center;
  align-content: center;
  text-align-last: ${({ textAlignLast }) => textAlignLast} !important;
  border: ${({ dollar }) => dollar && "1px solid rgba(34, 36, 38, .15)"} !important;
  border-radius: ${({ dollar }) => dollar && "3px"} !important;
  background: ${({ dollar }) => dollar && "rgb(255, 255, 255)"} !important;
  color: ${({ dollar }) => dollar && "black"} !important;
  text-align-last: center;

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

export const Price = ({ value }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Icon dollar name="dollar" />
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

export const Price2 = ({ value, onChange, editable, width, noBorder, dollar, height }) => {

  const handleValueChange = (values) => {
    const newValue = values.floatValue || 0;
    onChange(newValue);
  };

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <CurrencyFormatInput
        height={height}
        dollar={dollar}
        noBorder={noBorder}
        width={width}
        displayType={editable ? "input" : "text"}
        thousandSeparator={true}
        fixedDecimalScale={true}
        decimalScale={2}
        value={value}
        onValueChange={handleValueChange}
        disabled={!editable}
        allowNegative={false}
        placeholder="Precio"
      />
    </Flex>
  );
};