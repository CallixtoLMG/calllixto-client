import { ICONS } from "@/common/constants";
import { Flex, Icon } from "../../custom";
import { getFormatedNumber } from "@/common/utils";

export const PriceLabel = ({ value }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Icon dollar name={ICONS.DOLLAR} />
      <p>{getFormatedNumber(value)}</p>
    </Flex>
  );
};