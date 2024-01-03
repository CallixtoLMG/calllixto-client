import { formatedDate, formatedPercentage, formatedPhone, formatedPrice, getTotal, getTotalSum } from "@/utils";

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
    value: (budget) => formatedDate(budget.createdAt)
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
  { title: "Nombre", value: "name", id: 1, },
  { title: "Código", value: "code", id: 2, },
  { title: "Código Proveedor", value: "supplierCode", id: 3 },
  { title: "Precio", value: "price", id: 4 },
  { title: " Cantidad. ", value: "quantity", id: 5 },
  { title: "Descuento", value: "discount", id: 6 },
  { title: "Total", value: "total", id: 7 },
  { title: "Acciones", value: "actions", id: 8, hide: (readonly) => readonly },
];

const FILTERS = [
  { value: 'customer.name', placeholder: 'Cliente' },
  { value: 'seller', placeholder: 'Vendedor' },
];

const PAYMETHOD = [{
  text: 'Efectivo',
  key: "Efectivo",
  value: "Efectivo",
}, {
  text: 'Transferencia Bancaria',
  key: "Transferencia Bancaria",
  value: "Transferencia Bancaria",
}, {
  text: 'Tarjeta de débito',
  key: "Tarjeta de débito",
  value: "Tarjeta de débito",
}, {
  text: 'Tarjeta de crédito',
  key: "Tarjeta de crédito",
  value: "Tarjeta de crédito",
}, {
  text: 'Mercado Pago',
  key: "Mercado Pago",
  value: "Mercado Pago",
},];

export {
  BUDGETS_COLUMNS, BUDGET_FORM_PRODUCT_COLUMNS, FILTERS, PAYMETHOD, PRODUCTS_COLUMNS
};

