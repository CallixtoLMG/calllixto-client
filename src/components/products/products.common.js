import { formatedPrice, getBrandCode, getProductCode, getSupplierCode } from "@/utils";
import { Box, Flex } from "rebass";
import { Icon, Popup } from "semantic-ui-react";

const PRODUCT_COLUMNS = [
  {
    id: 1,
    title: "Código",
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
        {product.comments && (
          <Popup
            size="mini"
            content={product.comments}
            position="top center"
            trigger={
              <Box marginX="5px">
                <Icon name="info circle" color="orange" />
              </Box>
            }
          />
        )}
      </Flex>
  },
  {
    id: 3,
    title: "Precio",
    width: 2,
    value: (product) => formatedPrice(product.price)
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

export { BAN_FILTERS, BAN_PRODUCTS_COLUMNS, FILTERS, IMPORT_PRODUCTS_COLUMNS, PRODUCT_COLUMNS };

