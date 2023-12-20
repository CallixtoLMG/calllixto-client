import { formatedPrice } from "@/utils";

const PRODUCT_COLUMNS = [
  {
    title: "Código",
    id: 1,
    value: (product) => product.code
  },
  {
    title: "Nombre",
    id: 2,
    value: (product) => product.name,
  },
  {
    title: "Precio",
    id: 3,
    value: (product) => formatedPrice(product.price)
  }
];

export {
  PRODUCT_COLUMNS
};

