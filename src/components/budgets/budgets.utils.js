import { Flex } from "@/components/common/custom";
import { COLORS, DATE_FORMATS } from "@/common/constants";
import { formatedPercentage, getPrice, getTotal, isBudgetCancelled, isBudgetConfirmed } from "@/common/utils";
import { Label } from "semantic-ui-react";
import { PriceLabel } from "../common/form";
import { PRODUCT_STATES } from "@/components/products/products.common";
import { getFormatedDate } from "@/common/utils/dates";
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
        <Flex justifyContent="space-between">
          <span>{`${product.name} ${product.fractionConfig?.active ? ` x ${product.fractionConfig.value} ${product.fractionConfig.unit}` : ''}`}</span>
          {product.state === PRODUCT_STATES.OOS.id && (
            <Label color={COLORS.ORANGE} size="tiny">{PRODUCT_STATES.OOS.singularTitle}</Label>
          )}
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
      value: (product) => formatedPercentage(product.discount || 0)
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
