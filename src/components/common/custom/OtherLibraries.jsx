import { Icon } from "@/components/common/custom";
import { ICONS } from "@/constants";
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

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

export const Price = ({ value }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Icon dollar name={ICONS.DOLLAR} />
      <CurrencyFormatInput
        displayType="text"
        thousandSeparator={true}
        fixedDecimalScale={true}
        decimalScale={2}
        value={value}
      />
    </Flex>
  );
};

