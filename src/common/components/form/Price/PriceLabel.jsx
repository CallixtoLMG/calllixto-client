import { ICONS } from "@/common/constants";
import { getFormatedNumber } from "@/common/utils";
import { Flex, Icon } from "../../custom";

export const PriceLabel = ({ value }) => {
  return (
    <Flex $alignItems="center" $justifyContent="space-between">
      <Icon dollar="true" name={ICONS.DOLLAR} />
      <p>{getFormatedNumber(value)}</p>
    </Flex>
  );
};