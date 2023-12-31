import { Cell } from "@/components/common/table";
import { formatedDate, formatedPercentage, formatedPrice, getTotal, getTotalSum } from "@/utils";

const BUDGETS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 2,
    value: (budget) => budget.id
  },
  {
    id: 2,
    title: "Cliente",
    aligh: "left",
    value: (budget) => budget.customer.name
  },
  {
    id: 3,
    title: "Fecha",
    width: 4,
    value: (budget) => formatedDate(budget.createdAt)
  },
  {
    id: 4,
    title: "Total",
    width: 2,
    value: (budget) => formatedPrice(getTotalSum(budget.products))
  },
];

const PRODUCTS_COLUMNS = [
  {
    id: 1,
    title: "Descripción",
    align: "left",
    value: (product) => product.name
  },
  {
    id: 2,
    title: "Cant",
    width: 1,
    value: (product) => product.quantity || 0
  },
  {
    id: 3,
    title: "Precio",
    width: 1,
    value: (product) => formatedPrice(product.price || 0)
  },
  {
    id: 4,
    title: "Subtotal",
    width: 1,
    value: (product) => formatedPrice(product.price * product.quantity || 0),
    hide: true,
  },
  {
    id: 5,
    title: "Desc.",
    width: 1,
    value: (product) => formatedPercentage(product.discount || 0)
  },
  {
    id: 6,
    title: "Importe",
    width: 1,
    value: (product) => formatedPrice(getTotal(product))
  },
];

const BUDGET_FORM_PRODUCT_COLUMNS = [
  { title: "Nombre", value: "name", id: 1 },
  { title: "Precio", value: "price", id: 2 },
  { title: "Cantidad", value: "quantity", id: 3 },
  { title: "Subtotal", value: "subtotal", id: 4 },
  { title: "Desc.", value: "discount", id: 5 },
  { title: "Total", value: "total", id: 6 },
  { title: "Acciones", value: "actions", id: 7, hide: (readonly) => readonly },
];

export {
  BUDGETS_COLUMNS, BUDGET_FORM_PRODUCT_COLUMNS, PRODUCTS_COLUMNS
};

