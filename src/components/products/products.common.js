import { formatedPrice } from "@/utils";

const PRODUCT_COLUMNS = [
  {
    title: "Código",
    path: 'code',
    id: 1,
    value: (product) => product.code
  },
  {
    title: "Nombre",
    path: 'name',
    id: 2,
    value: (product) => product.name,
  },
  {
    title: "Precio",
    path: 'price',
    id: 3,
    value: (product) => formatedPrice(product.price)
  }
];

export {
  PRODUCT_COLUMNS
};

