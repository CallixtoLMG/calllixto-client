"use client";
import { createCustomer, LIST_CUSTOMERS_QUERY_KEY } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CreateCustomer = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { push } = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.CUSTOMERS.NAME, 'Crear']);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (customer) => {
      const response = await createCustomer(customer);
      return response;
    },
    onSuccess: async (response) => {
      if (response.statusOk) {
        toast.success('Cliente creado!');
        await queryClient.invalidateQueries({ queryKey: [LIST_CUSTOMERS_QUERY_KEY], refetchType: 'all' });
        push(PAGES.CUSTOMERS.BASE);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <CustomerForm onSubmit={mutate} isLoading={isPending} />
  )
};

export default CreateCustomer;
