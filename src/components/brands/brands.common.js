import { Flex } from '@/components/common/custom';
import { CommentTooltip } from "@/components/common/tooltips";

const ATTRIBUTES = { ID: "id", NAME: "name", COMMENT: "comments", STATE: "state" };

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

export {
  ATTRIBUTES, BRAND_COLUMNS
};

