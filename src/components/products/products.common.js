import { Cell } from "@/components/common/table";
import { formatedPrice } from "@/utils";

const PRODUCT_COLUMNS = [
  {
    title: "Código",
    id: 1,
    value: (product) => <Cell width={2}>{product.code}</Cell>
  },
  {
    title: "Nombre",
    id: 2,
    value: (product) => <Cell align="left" >{product.name}</Cell>
  },
  {
    title: "Precio",
    id: 3,
    value: (product) => <Cell width={3}>{formatedPrice(product.price)}</Cell>
  }
];

export {
  PRODUCT_COLUMNS
};

