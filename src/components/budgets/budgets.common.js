import { formatedDateAndHour, formatedPercentage, formatedPricePdf, getTotal, getTotalSum } from "@/utils";
import { Flex, Box } from "rebass";
import { CurrencyFormatInput } from "../common/custom";
import { Icon, Label } from "semantic-ui-react";
import { BUDGET_STATES, FILTER_TYPES } from "@/constants";

const ATTRIBUTES = {
  ID: "id",
  CUSTOMER: "customer",
  CREATEDAT: "createdAt",
  CONFIRMED: "confirmed",
  SELLER: "seller",
  PRODUCTS: "products",
  DISCOUNT: "globalDiscount",
  STATE: "state"
};

const BUDGETS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    align: "left",
    value: (budget) =>
      <Flex justifyContent="space-between">
        <Box width="25px">
          <Label ribbon color={BUDGET_STATES[budget.state.toUpperCase()]?.color}>
            {budget.id}
          </Label>
        </Box>
      </Flex>
  },
  {
    id: 2,
    title: "Cliente",
    align: "left",
    value: (budget) => budget.customer.name
  },
  {
    id: 3,
    title: "Fecha",
    width: 3,
    value: (budget) => formatedDateAndHour(budget.createdAt)
  },
  {
    id: 4,
    title: "Total",
    width: 2,
    value: (budget) => (
      <Flex alignItems="center" justifyContent="space-between">
        $
        <CurrencyFormatInput
          displayType="text"
          thousandSeparator={true}
          fixedDecimalScale={true}
          decimalScale={2}
          value={(getTotalSum(budget.products, budget.globalDiscount))}
        />
      </Flex>
    )
  },
  {
    id: 5,
    title: "Vendedor",
    align: "left",
    value: (budget) => budget.seller
  },
];

const PRODUCTS_COLUMNS = (dispatchPdf, budget) => {
  const includeDiscount = budget?.products?.some(product => product.discount);
  const includeDispatchComment = dispatchPdf && budget?.products?.some(product => product.dispatchComment);

  return [
    {
      id: 1,
      title: "Nombre",
      align: "left",
      wrap: true,
      value: (product) => product.name
    },
    {
      id: 2,
      title: "Cant",
      width: 1,
      value: (product) => product.quantity || 0
    },
    !dispatchPdf && {
      id: 3,
      title: "Precio",
      width: 2,
      value: (product) => formatedPricePdf(product.price || 0)
    },
    !dispatchPdf && includeDiscount && {
      id: 4,
      title: "Subtotal",
      width: 3,
      value: (product) => formatedPricePdf(product.price * product.quantity || 0),
    },
    !dispatchPdf && includeDiscount && {
      id: 5,
      title: "Desc.",
      width: 1,
      value: (product) => formatedPercentage(product.discount || 0)
    },
    !dispatchPdf && {
      id: 6,
      title: "Importe",
      width: 1,
      value: (product) => formatedPricePdf(getTotal(product))
    },
    includeDispatchComment && {
      id: 7,
      title: "Comentario",
      width: 7,
      wrap: true,
      value: (product) => product.dispatchComment
    }
  ].filter(Boolean);
};

const FILTERS = [
  {
    value: 'state',
    type: FILTER_TYPES.SELECT,
    options: [
      {
        key: 'ALL', value: 'ALL', text: 'Todos'
      },
      ...Object.keys(BUDGET_STATES).map(key => (
        {
          key,
          text: <Flex alignItems="center" justifyContent="space-between">{BUDGET_STATES[key].title}&nbsp;<Label color={BUDGET_STATES[key].color} circular empty /></Flex>,
          value: key
        }))
    ],
    defaultValue: 'ALL'
  },
  { value: 'id', placeholder: 'Código' },
  { value: 'customer', placeholder: 'Cliente', map: 'customer.name' },
  { value: 'seller', placeholder: 'Vendedor' },
];

const PAYMENT_METHODS = [{
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

export { ATTRIBUTES, BUDGETS_COLUMNS, FILTERS, PAYMENT_METHODS, PRODUCTS_COLUMNS };

