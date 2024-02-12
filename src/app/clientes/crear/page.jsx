"use client";
import { LIST_CUSTOMERS_QUERY_KEY, create } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { PAGES } from "@/constants";

const CreateCustomer = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const queryClient = useQueryClient();
  const { push } = useRouter();

  useEffect(() => {
    resetActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Clientes', 'Crear']);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (customer) => {
      const { data } = await create(customer);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_CUSTOMERS_QUERY_KEY] });
        toast.success('Cliente creado!');
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
