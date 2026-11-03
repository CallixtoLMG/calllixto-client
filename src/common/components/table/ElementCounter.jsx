import { CONTENT_SIZES, SIZES } from "@/common/constants";
import { formatInteger } from "@/common/utils/numbers";
import { Icon } from "semantic-ui-react";
import { Label } from "../custom";

const ElementCounter = ({ currentPage, pageSize, totalItems }) => {
  const startIndex = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <Label height="40px" fontWeight="400" width={CONTENT_SIZES.FIT} basic size={SIZES.LARGE}>
      <Icon name="list" />
      {formatInteger(startIndex)} - {formatInteger(endIndex)} de {formatInteger(totalItems)}
    </Label>
  );
};

export default ElementCounter;
