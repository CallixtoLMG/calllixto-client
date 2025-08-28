"use client";
import { useCreateExpense, useGetExpense } from "@/api/expenses";
import { PAGES } from "@/common/constants";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

const CreateExpense = () => {
  useValidateToken();
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get("clonar");
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const createExpense = useCreateExpense();
  const { data: expenseToClone, isLoading: loadingClone } = useGetExpense(cloneId);

  useEffect(() => {
    resetActions();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.EXPENSES.NAME, "Crear"]);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: createExpense,
    onSuccess: (response) => {
      if (response.statusOk) {
        push(PAGES.EXPENSES.SHOW(response.expense.id));
        toast.success("Gasto creado!");
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const clonedExpense = useMemo(() => {
    if (!expenseToClone) return undefined;

    const { id, createdAt, createdBy, updatedAt, updatedBy, state, ...rest } = expenseToClone;
    return {
      ...rest,
      paymentsMade: [],
    };
  }, [expenseToClone]);

  return (
    <ExpenseForm
      onSubmit={mutate}
      isLoading={isPending || loadingClone}
      expense={clonedExpense}
      isCloning={!!clonedExpense}
    />
  );
};

export default CreateExpense;
