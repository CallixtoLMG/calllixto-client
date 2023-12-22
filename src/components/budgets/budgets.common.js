import { formatedPrice, formatedPercentage, getTotal, formatedDate, getTotalSum } from "@/utils";
import { Cell } from "@/components/common/table";

const BUDGETS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    value: (budget) => <Cell>{budget.id}</Cell>
  },
  {
    id: 2,
    title: "Cliente",
    value: (budget) => <Cell>{budget.customer.name}</Cell>
  },
  {
    id: 3,
    title: "Fecha",
    value: (budget) => <Cell>{formatedDate(budget.createdAt)}</Cell>
  },
  {
    id: 4,
    title: "Total",
    value: (budget) => <Cell>{formatedPrice(getTotalSum(budget.products))}</Cell>
  },
];

const PRODUCTS_COLUMNS = [
  {
    id: 1,
    title: "Descripción",
    value: (product) => <Cell>{product.name}</Cell>
  },
  {
    id: 2,
    title: "Cantidad",
    value: (product) => <Cell>{product.quantity || 0}</Cell>
  },
  {
    id: 3,
    title: "Precio",
    value: (product) => <Cell>{formatedPrice(product.price || 0)}</Cell>
  },
  {
    id: 4,
    title: "Subtotal",
    value: (product) => <Cell>{formatedPrice(product.price * product.quantity || 0)}</Cell>
  },
  {
    id: 5,
    title: "Desc.",
    value: (product) => <Cell>{formatedPercentage(product.discount || 0)}</Cell>
  },
  {
    id: 6,
    title: "Importe",
    value: (product) => <Cell>{formatedPrice(getTotal(product))}</Cell>
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

