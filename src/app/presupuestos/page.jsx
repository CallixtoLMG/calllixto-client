"use client";
import { useListBudgets } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { ATTRIBUTES } from "@/components/budgets/budgets.common";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ENTITIES, PAGES, SHORTKEY } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Budgets = () => {
  useValidateToken();
  const { data, isLoading } = useListBudgets({ sort: 'date', order: false, attributes: ATTRIBUTES });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const { handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange(ENTITIES.BUDGETS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.BUDGETS.NAME]);
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

  useKeyboardShortcuts(() => push(PAGES.BUDGETS.CREATE), SHORTKEY.ENTER);

  return (
    <BudgetsPage isLoading={isLoading} budgets={budgets} />
  )
};

export default Budgets;
