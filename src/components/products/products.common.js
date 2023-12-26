import { Cell } from "@/components/common/table";
import { formatedPrice, getBrandCode, getProductCode, getSupplierCode } from "@/utils";
import { Icon, Popup } from "semantic-ui-react";
import { Flex, Box } from "rebass";

const PRODUCT_COLUMNS = [
  {
    title: "Código",
    id: 1,
    value: (product) =>
      <Cell width={2}>
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
      </Cell>
  },
  {
    title: "Código Proveedor",
    id: 2,
    value: (product) => <Cell width={1}>{product.supplierCode}</Cell>
  },
  {
    title: "Nombre",
    id: 4,
    value: (product) => <Cell align="left">
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
    </Cell>
  },
  {
    title: "Precio",
    id: 5,
    value: (product) => <Cell width={2}>{formatedPrice(product.price)}</Cell>
  }
];

export {
  PRODUCT_COLUMNS
};

