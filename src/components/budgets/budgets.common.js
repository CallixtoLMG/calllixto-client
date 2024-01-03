import { formatedPercentage, formatedPhone, formatedPrice, getTotal, getTotalSum } from "@/utils";
import dayjs from "dayjs";
import { Popup } from "semantic-ui-react";

const BUDGETS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    value: (budget) => budget.id
  },
  {
    id: 2,
    title: "Cliente",
    align: "left",
    value: (budget) => budget.customer.name
  },
  {
    id: 3,
    title: "Dirección",
    align: "left",
    width: 3,
    value: (budget) => budget.customer?.address
  },
  {
    id: 4,
    title: "Teléfono",
    align: "left",
    width: 3,
    value: (budget) => formatedPhone(budget.customer?.phone?.areaCode, budget.customer?.phone?.number)
  },
  {
    id: 5,
    title: "Fecha",
    width: 2,
    value: (budget) => (
      <Popup
      position="top center"
        content={dayjs(budget.createdAt).format('hh:mm A')}
        trigger={<span>{dayjs(budget.createdAt).format('DD-MM-YYYY')}</span>}
      />
    )
  },
  {
    id: 6,
    title: "Total",
    width: 2,
    value: (budget) => formatedPrice(getTotalSum(budget.products))
  },
  {
    id: 7,
    title: "Vendedor",
    align: "left",
    value: (budget) => budget.seller
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

const FILTERS = [
  { value: 'id', placeholder: 'Código' },
  { value: 'customerName', placeholder: 'Cliente', map: 'customer.name' },
  { value: 'seller', placeholder: 'Vendedor' },
];

export {
  BUDGETS_COLUMNS,
  BUDGET_FORM_PRODUCT_COLUMNS,
  PRODUCTS_COLUMNS,
  FILTERS
};

