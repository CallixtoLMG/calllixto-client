"use client";
import { useCreateCustomer } from "@/api/customers";
import { PAGES } from "@/common/constants";
import CustomerForm from "@/components/customers/CustomerForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks";
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
    setLabels([{ name: PAGES.CUSTOMERS.NAME }, { name: 'Crear' }]);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: createCustomer,
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.CUSTOMERS.SHOW(response.customer.id))
        toast.success('Cliente creado!');
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <CustomerForm
      onSubmit={mutate}
      isLoading={isPending}
    />
  )
};

export default CreateCustomer;
