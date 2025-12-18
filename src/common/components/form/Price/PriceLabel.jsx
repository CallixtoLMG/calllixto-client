import { ICONS } from "@/common/constants";
import { getFormatedNumber } from "@/common/utils";
import styled from "styled-components";
import { Flex, Icon } from "../../custom";

const P = (styled.p)`
  margin:0!important;
`;

export const PriceLabel = ({ value }) => {
  return (
    <Flex $alignItems="center" $justifyContent="space-between">
      <Icon dollar="true" name={ICONS.DOLLAR} />
      <P>{getFormatedNumber(value)}</P>
    </Flex>
  );
};