import { Flex } from "@/common/components/custom";
import { COLORS, DATE_FORMATS } from "@/common/constants";
import { getFormatedPercentage } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { getPrice, getTotal } from "@/components/products/products.utils";
import { PriceLabel } from "../../common/components/form";
import { BUDGET_STATES } from "./budgets.constants";

export const getLabelColor = (budget) => BUDGET_STATES[budget?.state]?.color;

export const getPopupContent = (budget) => {
  if (isBudgetConfirmed(budget?.state)) {
    return (
      <>
        <div>{`Confirmado por ${budget?.confirmedBy || "Sin vendedor"}`}</div>
        <div>{`Fecha: ${getFormatedDate(budget?.confirmedAt, DATE_FORMATS.DATE_WITH_TIME)}`}</div>
      </>
    );
  }
  if (isBudgetCancelled(budget?.state)) {
    return (
      <>
        <div>{`Anulado por ${budget?.cancelledBy || "Sin vendedor"}`}</div>
        <div>{`Fecha: ${getFormatedDate(budget?.cancelledAt, DATE_FORMATS.DATE_WITH_TIME)}`}</div>
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
      date: getFormatedDate(budget?.confirmedAt, DATE_FORMATS.DATE_WITH_TIME),
      dateLabel: "Fecha de confirmación"
    };
  }
  if (isBudgetCancelled(budget?.state)) {
    return {
      label: "Anulado por",
      color: COLORS.RED,
      person: budget?.cancelledBy || budget?.seller,
      date: getFormatedDate(budget?.cancelledAt, DATE_FORMATS.DATE_WITH_TIME),
      dateLabel: "Fecha de anulación"
    };
  }
  return null;
};

export const getProductsColumns = (dispatchPdf, budget) => {
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
      value: (product) => (
        <Flex $justifyContent="space-between">
          <span>{`${product.name} ${product.fractionConfig?.active ? ` x ${product.fractionConfig.value} ${product.fractionConfig.unit}` : ''}`}</span>
        </Flex>
      )
    },
    !dispatchPdf && {
      id: 3,
      title: "Precio",
      width: 2,
      value: (product) => <PriceLabel value={getPrice(product)} />
    },
    !dispatchPdf && includeDiscount && {
      id: 4,
      title: "Subtotal",
      width: 2,
      value: (product) => <PriceLabel value={getPrice(product) * product.quantity} />
    },
    !dispatchPdf && includeDiscount && {
      id: 5,
      title: "Desc.",
      width: 1,
      value: (product) => getFormatedPercentage(product.discount || 0)
    },
    !dispatchPdf && {
      id: 6,
      title: "Importe",
      width: 2,
      value: (product) => <PriceLabel value={getTotal(product)} />
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

export const getTotalSum = (products, discount = 0, additionalCharge = 0) => {
  const subtotal = products?.reduce((a, b) => a + getTotal(b), 0) ?? 0;
  const discountedSubtotal = subtotal - (subtotal * (discount / 100));
  const total = discountedSubtotal + (discountedSubtotal * (additionalCharge / 100));
  return total;
};

export const getSubtotal = (total, discountOrCharge) => {
  const subtotal = total + (total * (discountOrCharge / 100));
  return subtotal;
};

export const isBudgetDraft = (status) => {
  return status === BUDGET_STATES.DRAFT.id;
};

export const isBudgetConfirmed = (status) => {
  return status === BUDGET_STATES.CONFIRMED.id;
};

export const isBudgetCancelled = (status) => {
  return status === BUDGET_STATES.CANCELLED.id;
};

export const isBudgetPending = (status) => {
  return status === BUDGET_STATES.PENDING.id;
};

export const isBudgetExpired = (status) => {
  return status === BUDGET_STATES.EXPIRED.id;
};
