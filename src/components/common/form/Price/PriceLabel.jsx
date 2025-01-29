import { ICONS } from "@/constants";
import { Flex, Icon } from "../../custom";
import { formatedNumber } from "@/utils";

export const PriceLabel = ({ value }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Icon dollar name={ICONS.DOLLAR} />
      <p>{formatedNumber(value)}</p>
    </Flex>
  );
};