import { Box, Flex, Price } from "@/components/common/custom";
import { BUDGET_STATES } from "@/constants";
import { formatedDateAndHour, formatedPercentage, getPrice, getTotal, getTotalSum } from "@/utils";
import { Label } from "semantic-ui-react";
import { CommentTooltip } from "../common/tooltips";

const ATTRIBUTES = {
  ID: "id",
  CUSTOMER: "customer",
  CREATEDAT: "createdAt",
  CONFIRMED: "confirmed",
  SELLER: "seller",
  PRODUCTS: "products",
  DISCOUNT: "globalDiscount",
  STATE: "state",
  FRACTION_CONFIG: "fractionConfig",
};

const BUDGETS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    align: "left",
    value: (budget) =>
      <Box width="60px">
        <Label ribbon color={BUDGET_STATES[budget?.state]?.color}>
          {budget.id}
        </Label>
      </Box>
  },
  {
    id: 2,
    title: "Cliente",
    align: "left",
    value: (budget) =>
      <Flex justifyContent="space-between">
        {budget.customer.name}
        {budget.comments && <CommentTooltip comment={budget.comments} />}
      </Flex>
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
    value: (budget) => <Price value={(getTotalSum(budget.products, budget.globalDiscount))} />
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
  const includeDispatchComment = dispatchPdf && budget?.products?.some(product => product.dispatchComment || product.dispatch?.comment);

  return [
    {
      id: 1,
      title: "Cant",
      width: 1,
      value: (product) => product.quantity
    },
    {
      id: 2,
      title: "Nombre",
      align: "left",
      wrap: true,
      value: (product) => `${product.name} ${product.fractionConfig?.active ? ` x ${product.fractionConfig?.value} ${product.fractionConfig?.unit}` : ''}`
    },
    !dispatchPdf && {
      id: 3,
      title: "Precio",
      width: 2,
      value: (product) => <Price value={getPrice(product)} />
    },
    !dispatchPdf && includeDiscount && {
      id: 4,
      title: "Subtotal",
      width: 2,
      value: (product) => <Price value={getPrice(product) * product.quantity} />
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
      width: 2,
      value: (product) => <Price value={getTotal(product)} />
    },
    includeDispatchComment && {
      id: 7,
      title: "Comentario",
      width: 7,
      wrap: true,
      value: (product) => product.dispatchComment || product?.dispatch?.comment
    }
  ].filter(Boolean);
};

const PAYMENT_METHODS = [
  { key: 'efectivo', text: 'Efectivo', value: 'Efectivo' },
  { key: 'transferencia', text: 'Transferencia Bancaria', value: 'Transferencia Bancaria' },
  { key: 'debito', text: 'Tarjeta de Débito', value: 'Tarjeta de Débito' },
  { key: 'credito', text: 'Tarjeta de Crédito', value: 'Tarjeta de Crédito' },
  { key: 'mercado_pago', text: 'Mercado Pago', value: 'Mercado Pago' },
  { key: 'dolares', text: 'Dólares', value: 'Dólares' }
];

const PAYMENT_TABLE_HEADERS = [
  { id: 'method', width: 4, title: 'Método de Pago', value: (element) => element.method },
  { id: 'amount', width: 3, title: 'Monto', value: (element) => <Price value={element.amount} /> },
  { id: 'comments', width: 9, align: "left", title: 'Comentarios', value: (element) => element.comments }
];

export { ATTRIBUTES, BUDGETS_COLUMNS, PAYMENT_METHODS, PAYMENT_TABLE_HEADERS, PRODUCTS_COLUMNS };

