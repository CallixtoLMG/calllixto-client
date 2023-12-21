import { formatedPrice } from "@/utils";
import { Cell } from "../Table/styles";

const PRODUCT_COLUMNS = [
  {
    title: "Código",
    id: 1,
    value: (product) => <Cell>{product.code}</Cell>
  },
  {
    title: "Nombre",
    id: 2,
    value: (product) => <Cell>{product.name}</Cell>
  },
  {
    title: "Precio",
    id: 3,
    value: (product) => <Cell>{formatedPrice(product.price)}</Cell>
  }
];

export {
  PRODUCT_COLUMNS
};

