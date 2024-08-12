"use client";
import { useListAllBudgets } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Budgets = () => {
  useValidateToken();
  const { data, isLoading } = useListAllBudgets();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

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

  useKeyboardShortcuts(() => push(PAGES.BUDGETS.CREATE), SHORTKEYS.ENTER);

  return (
    <BudgetsPage isLoading={isLoading} budgets={budgets} />
  )
};

export default Budgets;
