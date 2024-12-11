import { Flex, OverflowCell, Price } from "@/components/common/custom";
import { CommentTooltip, TagsTooltip } from "@/components/common/tooltips";
import { getBrandCode, getProductCode, getSupplierCode } from "@/utils";
import { Popup } from "semantic-ui-react";

const ATTRIBUTES = {
  CODE: "code",
  NAME: "name",
  PRICE: "price",
  COMMENTS: "comments",
  BRAND_NAME: "brandName",
  SUPPLIER_NAME: "supplierName",
  EDITABLE_PRICE: "editablePrice",
  FRACTION_CONFIG: "fractionConfig",
  STATE: "state",
  TAGS: "tags"
};

const PRODUCT_COLUMNS = [
  {
    id: 1,
    title: "Código",
    align: "left",
    width: 2,
    value: (product) =>
      <>
        <Popup
          size="tiny"
          content={product.supplierName}
          position="top center"
          trigger={<span>{getSupplierCode(product.code)}</span>}
        />&nbsp;
        <Popup
          size="tiny"
          content={product.brandName}
          position="top center"
          trigger={<span>{getBrandCode(product.code)}</span>}
        />&nbsp;
        <span>{getProductCode(product.code)}</span>
      </>
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (product) => {
      const { tags, name, comments } = product;
      return (
        <Flex justifyContent="space-between" alignItems="center">
          <OverflowCell maxWidth="50vw" text={name} />
          <Flex columnGap="7px" alignItems="center" justifyContent="flex-end">
            {tags && <TagsTooltip tags={tags} />}
            {comments && <CommentTooltip comment={comments} />}
          </Flex>
        </Flex>
      );
    }
  },
  {
    id: 3,
    title: "Precio",
    width: 2,
    value: (product) => <Price value={product.price} />,
  }
];

const IMPORT_PRODUCTS_COLUMNS = [
  {
    id: 1,
    title: "Código",
    width: 2,
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
  },
  {
    id: 3,
    title: "Precio",
    width: 2,
  },
  {
    id: 4,
    title: "Comentarios",
    align: "left",
  }
];

const BAN_PRODUCTS_COLUMNS = [
  {
    id: 1,
    title: "Código",
    value: (product) =>
      product.code
  },
];

const BAN_FILTERS = [
  { value: 'code', placeholder: 'Código' },
];

export { ATTRIBUTES, BAN_FILTERS, BAN_PRODUCTS_COLUMNS, IMPORT_PRODUCTS_COLUMNS, PRODUCT_COLUMNS };

