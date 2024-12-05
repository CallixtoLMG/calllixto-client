"use client";
import { useCreateCustomer } from "@/api/customers";
import { useGetSetting } from "@/api/settings";
import CustomerForm from "@/components/customers/CustomerForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

const CreateCustomer = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { push } = useRouter();
  const createCustomer = useCreateCustomer();
  const { data: customersSettings, isLoading: isLoadingcustomersSettings } = useGetSetting("products");

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.CUSTOMERS.NAME, 'Crear']);
  }, [setLabels]);

  const mappedTags = useMemo(() => customersSettings?.settings?.tags?.map(tag => ({
    ...tag,
    key: tag.id,
    value: tag.name,
    text: tag.name,
  })), [customersSettings]);


  const { mutate, isPending } = useMutation({
    mutationFn: async (customer) => {
      const response = await createCustomer(customer);
      return response;
    },
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
    <CustomerForm onSubmit={mutate} isLoading={isPending} tags={mappedTags} />
  )
};

export default CreateCustomer;
