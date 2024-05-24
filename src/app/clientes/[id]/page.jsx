"use client";
import { useUserContext } from "@/User";
import { GET_CUSTOMER_QUERY_KEY, LIST_CUSTOMERS_QUERY_KEY, edit, useGetCustomer } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const Customer = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const queryClient = useQueryClient();
  const { data: customer, isLoading } = useGetCustomer(params.id);
  const [allowUpdate, Toggle] = useAllowUpdate();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { role } = useUserContext();
  const visibilityRules = Rules(role);

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Clientes', customer?.name]);
  }, [customer, setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (customer) => {
      const { data } = await edit(customer);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_CUSTOMERS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [GET_CUSTOMER_QUERY_KEY, params.id] });
        toast.success('Cliente actualizado!');
        push(PAGES.CUSTOMERS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  if (!isLoading && !customer) {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <Loader active={isLoading}>
      {visibilityRules.canSeeActions && Toggle}
      <CustomerForm
        customer={customer}
        onSubmit={mutate}
        isLoading={isPending}
        readonly={!allowUpdate}
      />
    </Loader>
  );
};

export default Customer;
