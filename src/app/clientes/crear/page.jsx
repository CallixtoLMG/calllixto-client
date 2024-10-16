"use client";
import { useCreateCustomer } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CreateCustomer = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { push } = useRouter();
  const createCustomer = useCreateCustomer();

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
        push(PAGES.CUSTOMERS.BASE);
      } else {
        toast.error(response.error.message);
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
