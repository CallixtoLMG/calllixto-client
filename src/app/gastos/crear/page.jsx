"use client";
import { useCreateExpense } from "@/api/expenses";
import { PAGES } from "@/common/constants";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CreateExpense = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { push } = useRouter();
  const createExpense = useCreateExpense();
  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.EXPENSES.NAME, 'Crear']);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (expense) => {
      const response = await createExpense(expense);
      return response;
    },
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.EXPENSES.SHOW(response.expense.id))
        toast.success('Gasto creado!');
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <ExpenseForm onSubmit={mutate} isLoading={isPending} />
  )
};

export default CreateExpense;