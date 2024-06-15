import { getBrandCode, getProductCode, getSupplierCode } from "@/utils";
import { Flex } from "rebass";
import { Popup } from "semantic-ui-react";
import { Price } from "@/components/common/custom";
import { CommentTooltip } from "@/components/common/tooltips";

const ATTRIBUTES = { CODE: "code", NAME: "name", PRICE: "price", COMMENTS: "comments", BRAND_NAME: "brandName", SUPPLIER_NAME: "supplierName" };

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
    value: (product) =>
      <Flex justifyContent="space-between">
        {product.name}
        {product.comments && <CommentTooltip comment={product.comments} />}
      </Flex>
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

const FILTERS = [
  { value: 'code', placeholder: 'Código' },
  { value: 'name', placeholder: 'Nombre' }
];

const BAN_FILTERS = [
  { value: 'code', placeholder: 'Código' },
];

export { ATTRIBUTES, BAN_FILTERS, BAN_PRODUCTS_COLUMNS, FILTERS, IMPORT_PRODUCTS_COLUMNS, PRODUCT_COLUMNS };

