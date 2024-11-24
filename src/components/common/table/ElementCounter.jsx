import { Icon } from "semantic-ui-react";
import { Label } from "../custom";

const ElementCounter = ({ currentPage, pageSize, totalItems }) => {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <Label height="40px" fontWeight="400" width="fit-content" basic size="large">
      <Icon name="list" />
      {startIndex} - {endIndex} de {totalItems}
    </Label>
  );
};

export default ElementCounter;