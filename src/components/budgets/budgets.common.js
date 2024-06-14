import { formatedDateAndHour, formatedPercentage, formatedPricePdf, getTotal, getTotalSum } from "@/utils";
import { Flex } from "rebass";
import { CurrencyFormatInput } from "../common/custom";
import { Icon } from "../common/custom/Semantic";

const ATTRIBUTES = { ID: "id", CUSTOMER: "customer", CREATEDAT: "createdAt", CONFIRMED: "confirmed", SELLER: "seller", PRODUCTS: "products", DISCOUNT: "globalDiscount" };

const BUDGETS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    align: "left",
    value: (budget) =>
      budget.confirmed ?
        <Flex justifyContent="space-between">
          {budget.id}<Icon size="small" name="check circle" color="green" />
        </Flex>
        : budget.id
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
  const includeDispatchComment = dispatchPdf && budget?.products?.some(product => product.dispatch?.comment);

  return [
    {
      id: 1,
      title: "Nombre",
      align: "left",
      wrap: true,
      value: (product) => product.dispatch?.name || product.name
    },
    {
      id: 2,
      title: "Cant",
      width: 1,
      value: (product) => product.dispatch?.quantity || product.quantity
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
      value: (product) => product.dispatch?.comment
    }
  ].filter(Boolean);
};

const FILTERS = [
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

