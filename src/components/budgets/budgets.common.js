import { Cell } from "@/components/common/table";
import { formatedDate, formatedPercentage, formatedPrice, getTotal, getTotalSum } from "@/utils";

const BUDGETS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    value: (budget) => <Cell width={2}>{budget.id}</Cell>
  },
  {
    id: 2,
    title: "Cliente",
    value: (budget) => <Cell align="left">{budget.customer.name}</Cell>
  },
  {
    id: 3,
    title: "Fecha",
    value: (budget) => <Cell width={4}>{formatedDate(budget.createdAt)}</Cell>
  },
  {
    id: 4,
    title: "Total",
    value: (budget) => <Cell width={2}>{formatedPrice(getTotalSum(budget.products))}</Cell>
  },
];

const PRODUCTS_COLUMNS = [
  {
    id: 1,
    title: "Descripción",
    value: (product) => <Cell align="true" >{product.name}</Cell>
  },
  {
    id: 2,
    title: "Cant",
    value: (product) => <Cell width={1}>{product.quantity || 0}</Cell>
  },
  {
    id: 3,
    title: "Precio",
    value: (product) => <Cell width={1}>{formatedPrice(product.price || 0)}</Cell>
  },
  {
    id: 4,
    title: "Subtotal",
    value: (product) => <Cell width={1}>{formatedPrice(product.price * product.quantity || 0)}</Cell>,
    hide: true,
  },
  {
    id: 5,
    title: "Desc.",
    value: (product) => <Cell width={1}>{formatedPercentage(product.discount || 0)}</Cell>
  },
  {
    id: 6,
    title: "Importe",
    value: (product) => <Cell width={1}>{formatedPrice(getTotal(product))}</Cell>
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
  BUDGETS_COLUMNS, BUDGET_FORM_PRODUCT_COLUMNS, PRODUCTS_COLUMNS
};

