import { formatedPrice, getTotal, formatedDate, getTotalSum } from "@/utils";

const BUDGETS_COLUMNS = [
  {
    title: "Id",
    value: (budget) => budget.id
  },
  {
    title: "Cliente",
    value: (budget) => budget.customer.name
  },
  {
    title: "Fecha",
    value: (budget) => formatedDate(budget.createdAt)
  },
  {
    title: "Total",
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
    title: "Precio",
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

const BUDGET_FORM_PRODUCT_COLUMNS = [
  { title: "Nombre", value: "name", id: 1 },
  { title: "Precio", value: "price", id: 2 },
  { title: "Cantidad", value: "quantity", id: 3 },
  { title: "Subtotal", value: "subtotal", id: 4 },
  { title: "Desc.", value: "discount", id: 5 },
  { title: "Total", value: "total", id: 6 },
  { title: "Acciones", value: "actions", id: 7 },
];

export {
  BUDGETS_COLUMNS, PRODUCTS_COLUMNS, BUDGET_FORM_PRODUCT_COLUMNS
};

