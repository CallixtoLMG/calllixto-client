"use client";
import { useListBudgets } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";
import { ATTRIBUTES } from "@/components/budgets/budgets.common";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Budgets = () => {
  useValidateToken();
  const { data, isLoading } = useListBudgets({ sort: 'date', order: false, attributes: [ATTRIBUTES.ID, ATTRIBUTES.PRODUCTS, ATTRIBUTES.CUSTOMER, ATTRIBUTES.CREATEDAT, ATTRIBUTES.CONFIRMED, ATTRIBUTES.SELLER] });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const { handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange("budgets")
  }, []);

  useEffect(() => {
    setLabels(['Presupuestos']);
  }, [setLabels]);

  const { budgets } = useMemo(() => {
    return { budgets: data?.budgets }
  }, [data]);

  useEffect(() => {
    const actions = [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.BUDGETS.CREATE) },
        text: 'Crear'
      }
    ];
    setActions(actions);
  }, [push, setActions]);

  return (
    <BudgetsPage isLoading={isLoading} budgets={budgets} />
  )
};

export default Budgets;
