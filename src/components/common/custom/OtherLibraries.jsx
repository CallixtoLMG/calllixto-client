import { Icon } from "@/components/common/custom";
import { ICONS } from "@/constants";
import styled from "styled-components";
import { Flex } from './Flex';
import { Input } from "semantic-ui-react";

export const CurrencyFormatInput = styled(Input)`
  box-shadow: ${({ $shadow }) => $shadow && " 0 1px 2px 0 rgba(34,36,38,.15)!important"};
  width: ${({ width }) => width && `${width}!important`};
  height: ${({ height = '30px' }) => height} !important;
  align-items: center;
  align-content: center;
  text-align-last: ${({ textAlignLast }) => textAlignLast} !important;
  opacity: ${({ disabled }) => disabled ? '0.3' : '1'};

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

