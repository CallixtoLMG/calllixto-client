"use client";
import { LIST_BUDGETS_QUERY_KEY, useListAllBudgets } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ENTITIES, PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useRestoreEntity } from "@/hooks/common";

const Budgets = () => {
  useValidateToken();
  const { data, isLoading, isRefetching } = useListAllBudgets();
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
