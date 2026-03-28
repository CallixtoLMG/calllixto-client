import { getSubtotal, getTotalSum } from "@/components/budgets/budgets.utils";
import { useMemo } from "react";

const useBudgetTotals = ({
  products,
  globalDiscount,
  additionalCharge,
}) => {
  const safeDiscount = Number(globalDiscount ?? 0);
  const safeCharge = Number(additionalCharge ?? 0);

  const subtotal = useMemo(
    () => getTotalSum(products),
    [products]
  );

  const subtotalAfterDiscount = useMemo(
    () => getSubtotal(subtotal, -safeDiscount),
    [subtotal, safeDiscount]
  );

  const total = useMemo(
    () => getSubtotal(subtotalAfterDiscount, safeCharge),
    [subtotalAfterDiscount, safeCharge]
  );

  return {
    subtotal,
    subtotalAfterDiscount,
    total,
  };
};

export default useBudgetTotals;
