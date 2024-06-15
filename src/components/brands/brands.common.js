import { Flex } from "rebass";
import CommentTooltip from "@/components/common/tooltips/CommentTooltip";

const ATTRIBUTES = { ID: "id", NAME: "name", COMMENT: "comments" };

const BRAND_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    value: (brand) => brand.id
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (brand) =>
      <Flex justifyContent="space-between">
        {brand.name}
        {brand.comments && <CommentTooltip comment={brand.comments} />}
      </Flex>
  }
];

const FILTERS = [
  { value: 'id', placeholder: 'Id' },
  { value: 'name', placeholder: 'Nombre' },
];

export {
  ATTRIBUTES, BRAND_COLUMNS,
  FILTERS
};

