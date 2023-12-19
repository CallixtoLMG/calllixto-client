import { formatedPrice, getTotal, formatedDate, getTotalSum } from "@/utils";

const BUDGETS_COLUMNS = [
  {
    value: "id",
    value: (budget) => budget.id
  },
  {
    name: "Cliente",
    value: (budget) => budget.customer.name
  },
  {
    name: "Fecha",
    value: (budget) => formatedDate(budget.createdAt)
  },
  {
    name: "Total",
    value: (budget) => formatedPrice(getTotalSum(budget.products))
  },
];

const PRODUCTS_COLUMNS = [
  {
    title: "Descripción",
    value: (product) => product.name,
    id: 1
  },
  {
    title: "Cantidad",
    value: (product) => product.quantity || 0,
    id: 2
  },
  {
    title: "Precio Unitario",
    value: (product) => formatedPrice(product.price || 0),
    id: 3
  },
  {
    title: "Subtotal",
    value: (product) => formatedPrice(product.price * product.quantity || 0),
    id: 4
  },
  {
    title: "Desc. %",
    value: (product) => product.discount || 0,
    id: 5
  },
  {
    title: "Importe",
    value: (product) => formatedPrice(getTotal(product)),
    id: 6
  },

];

const SHOW_PRODUCTS_HEADERS = [
  { name: "Nombre", value: "name", id: 1 },
  { name: "Precio", value: "price", id: 2 },
  { name: "Cantidad", value: "quantity", id: 3 },
  { name: "Subtotal", value: "subtotal", id: 4 },
  { name: "Desc.", value: "discount", id: 5 },
  { name: "Total", value: "total", id: 6 },
  { name: "Acciones", value: "actions", id: 7 },
];

export {
  BUDGETS_COLUMNS, PRODUCTS_COLUMNS, SHOW_PRODUCTS_HEADERS
};

