"use client";
import { LIST_BUDGETS_QUERY_KEY, useListBudgets } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ENTITIES, PAGES, SHORTKEYS } from "@/constants";
import { useRestoreEntity } from "@/hooks/common";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { downloadExcel, formatedDateAndHour, formatedPrice, getTotalSum } from "@/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Budgets = () => {
  useValidateToken();
  const { data, isLoading, isRefetching } = useListBudgets();
  const restoreEntity = useRestoreEntity({ entity: ENTITIES.BUDGETS, key: LIST_BUDGETS_QUERY_KEY });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.BUDGETS.NAME]);
  }, [setLabels]);

  const budgets = useMemo(() => data?.budgets, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  useEffect(() => {
    const handleRestore = async () => {
      await restoreEntity();
    };

    const prepareBudgetDataForExcel = (budgets) => {
      const headers = ['ID', 'Cliente', 'Fecha', "Total", "Vendedor"];

      const budgetData = budgets.map(budget => [
        budget.id,
        budget.customer.name,
        formatedDateAndHour(budget.createdAt),
        formatedPrice(getTotalSum(budget.products, budget.globalDiscount)),
        budget.seller
      ]);

      return [headers, ...budgetData];
    };

    const actions = [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.BUDGETS.CREATE) },
        text: 'Crear'
      },
      {
        id: 2,
        icon: 'undo',
        color: 'grey',
        onClick: handleRestore,
        text: 'Actualizar',
        disabled: loading,
        width: "fit-content",
      },
      {
        id: 3,
        icon: 'excel file',
        color: 'gray',
        width: "fit-content",
        onClick: () => {
          const formattedData = prepareBudgetDataForExcel(budgets);
          downloadExcel(formattedData, "Lista de Presupuestos");
        },
        text: 'Presupuetos',
        disabled: loading
      },
    ];
    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.BUDGETS.CREATE), SHORTKEYS.ENTER);

  return (
    <BudgetsPage isLoading={loading} budgets={loading ? [] : budgets} />
  )
};

export default Budgets;
