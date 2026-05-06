"use client";
import { useCreateExpense, useGetExpense } from "@/api/expenses";
import { UnsavedChangesModal } from "@/common/components/modals";
import { PAGES } from "@/common/constants";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useUnsavedChanges, useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
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
  const formRef = useRef(null);
  const expenseUnsaved = useUnsavedChanges({
    formRef,
    onDiscard: () => formRef.current?.resetForm(),
  });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.EXPENSES.NAME }, { name: 'Crear' }]);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: createExpense,
    onSuccess: (response) => {
      if (response.statusOk) {
        push(PAGES.EXPENSES.SHOW(response.expense.id));
        toast.success("Gasto creado!");
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }
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
    <>
      <ExpenseForm
        ref={formRef}
        onSubmit={mutate}
        isLoading={isPending || loadingClone}
        expense={clonedExpense}
        isCloning={!!clonedExpense}
      />
      <UnsavedChangesModal
        open={expenseUnsaved.showModal}
        onDiscard={expenseUnsaved.handleDiscard}
        onContinue={expenseUnsaved.handleContinue}
      />
    </>
  );
};

export default CreateExpense;
