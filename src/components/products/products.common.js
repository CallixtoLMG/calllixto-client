import { formatedPrice, getBrandCode, getProductCode, getSupplierCode } from "@/utils";
import { Icon, Popup } from "semantic-ui-react";
import { Flex, Box } from "rebass";

const PRODUCT_COLUMNS = [
  {
    id: 1,
    title: "Código",
    width: 2,
    value: (product) =>
      <>
        <Popup
          size="tiny"
          content={product.supplier}
          position="top center"
          trigger={<span>{getSupplierCode(product.code)}</span>}
        />&nbsp;
        <Popup
          size="tiny"
          content={product.brand}
          position="top center"
          trigger={<span>{getBrandCode(product.code)}</span>}
        />&nbsp;
        <span>{getProductCode(product.code)}</span>
      </>
  },
  {
    id: 2,
    title: "Código Proveedor",
    width: 1,
    value: (product) => product.supplierCode || '-'
  },
  {
    id: 3,
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
    id: 4,
    title: "Precio",
    width: 2,
    value: (product) => formatedPrice(product.price)
  }
];

const FILTERS = [
  { value: 'code', placeholder: 'Código' },
  { value: 'supplierCode', placeholder: 'Código proveedor' },
  { value: 'name', placeholder: 'Nombre' }
];

export {
  PRODUCT_COLUMNS,
  FILTERS
};
