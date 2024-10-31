import { Box, Flex, Price } from "@/components/common/custom";
import { BUDGET_STATES, COLORS } from "@/constants";
import { formatedDateAndHour, formatedPercentage, getPrice, getTotal, getTotalSum, isBudgetCancelled, isBudgetConfirmed } from "@/utils";
import { Label, Popup } from "semantic-ui-react";
import { CommentTooltip } from "../common/tooltips";

const ATTRIBUTES = {
  ID: "id",
  CUSTOMER: "customer",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  CONFIRMED: "confirmed",
  SELLER: "seller",
  PRODUCTS: "products",
  DISCOUNT: "globalDiscount",
  STATE: "state",
  ADDITIONAL_CHARGE: "additionalCharge",
  PAYMENT_METHODS: "paymentMethods",
  PAYMENTS_MADE: "paymentsMade",
  EXPIRATION_OFF_SET_DAYS: "expirationOffsetDays",
  PICKUP_IN_STORE: "pickUpInStore",
  TOTAL: "total",
  CONFIRMED_AT: "confirmedAt",
  CONFIRMED_BY: "confirmedBy",
  CANCELLED_AT: "cancelledAt",
  CANCELLED_BY: "cancelledBy"
};

const getLabelColor = (budget) => BUDGET_STATES[budget?.state]?.color;

const getPopupContent = (budget) => {
  if (isBudgetConfirmed(budget?.state)) {
    return (
      <>
        <div>{`Confirmado por ${budget?.confirmedBy || "Sin vendedor"}`}</div>
        <div>{`Fecha: ${formatedDateAndHour(budget?.confirmedAt)}`}</div>
      </>
    );
  }
  if (isBudgetCancelled(budget?.state)) {
    return (
      <>
        <div>{`Anulado por ${budget?.cancelledBy || "Sin vendedor"}`}</div>
        <div>{`Fecha: ${formatedDateAndHour(budget?.cancelledAt)}`}</div>
      </>
    );
  }
  return null;
};

export const getBudgetState = (budget) => {
  if (isBudgetConfirmed(budget?.state)) {
    return {
      label: "Confirmado por",
      color: COLORS.GREEN,
      person: budget?.confirmedBy || budget?.seller,
      date: formatedDateAndHour(budget?.confirmedAt),
      dateLabel: "Fecha de confirmación"
    };
  }
  if (isBudgetCancelled(budget?.state)) {
    return {
      label: "Anulado por",
      color: COLORS.RED,
      person: budget?.cancelledBy || budget?.seller,
      date: formatedDateAndHour(budget?.cancelledAt),
      dateLabel: "Fecha de anulación"
    };
  }
  return null;
};

const BUDGETS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    align: "left",
    value: (budget) => (
      <Box width="60px">
        {isBudgetConfirmed(budget?.state) || isBudgetCancelled(budget?.state) ? (
          <Popup
            trigger={
              <Label ribbon color={getLabelColor(budget)}>
                {budget.id}
              </Label>
            }
            content={getPopupContent(budget)}
            position="right center"
            size="mini"
          />
        ) : (
          <Label ribbon color={getLabelColor(budget)}>
            {budget.id}
          </Label>
        )}
      </Box>
    )
  },
  {
    id: 2,
    title: "Cliente",
    align: "left",
    value: (budget) => (
      <Flex justifyContent="space-between">
        {budget.customer.name}
        {budget.comments && <CommentTooltip comment={budget.comments} />}
      </Flex>
    )
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
      <Price value={getTotalSum(budget.products, budget.globalDiscount, budget.additionalCharge)} />
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
  { id: 'method', width: 4, title: 'Método', value: (element) => element.method },
  { id: 'amount', width: 3, title: 'Monto', value: (element) => <Price value={element.amount} /> },
  { id: 'comments', width: 9, align: "left", title: 'Comentarios', value: (element) => element.comments }
];

export { ATTRIBUTES, BUDGETS_COLUMNS, PAYMENT_METHODS, PAYMENT_TABLE_HEADERS, PRODUCTS_COLUMNS };

