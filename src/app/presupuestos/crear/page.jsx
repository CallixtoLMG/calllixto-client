"use client";
import { useUserContext } from "@/User";
import { LIST_BUDGETS_QUERY_KEY, useGetBudget } from "@/api/budgets";
import { useListAllCustomers } from "@/api/customers";
import { useListAllProducts } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { ATTRIBUTES as CUSTOMERS_ATTRIBUTES } from "@/components/customers/customers.common";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ATTRIBUTES as PRODUCTS_ATTRIBUTES } from "@/components/products/products.common";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

const CreateBudget = () => {
  useValidateToken();
  const { userData } = useUserContext();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('clonar');
  const { push } = useRouter();

  const { data: productsData, isLoading: loadingProducts } = useListAllProducts({ attributes: PRODUCTS_ATTRIBUTES, enabled: true });
  const { data: customersData, isLoading: loadingCustomers } = useListAllCustomers({ attributes: [CUSTOMERS_ATTRIBUTES.ADDRESSES, CUSTOMERS_ATTRIBUTES.PHONES, CUSTOMERS_ATTRIBUTES.ID, CUSTOMERS_ATTRIBUTES.NAME], enabled: true });
  const { data: budget, isLoading: loadingBudget } = useGetBudget(cloneId);

  const products = useMemo(() => productsData?.products, [productsData]);
  const customers = useMemo(() => customersData?.customers, [customersData]);

  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.BUDGETS.NAME, 'Crear']);
  }, [setLabels]);

  const mappedProducts = useMemo(() => products?.map(product => ({
    ...product,
    key: product.code,
    value: product.name,
    text: product.name,
  })), [products]);

  const mappedCustomers = useMemo(() => customers?.map(customer => ({
    ...customer,
    key: customer.name,
    value: customer.name,
    text: customer.name,
  })), [customers]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (budget) => {
      // const { data } = await create(budget);
      // return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BUDGETS_QUERY_KEY] });
        toast.success('Presupuesto creado!');
        push(PAGES.BUDGETS.BASE);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const clonedBudget = useMemo(() => {
    if (budget) {
      const { customer, id, ...clonedBudget } = budget;
      return clonedBudget;
    }
  }, [budget]);

  return (
    <Loader active={loadingProducts || loadingCustomers || loadingBudget}>
      <BudgetForm
        onSubmit={mutate}
        products={mappedProducts}
        customers={mappedCustomers}
        user={userData}
        budget={clonedBudget}
        isCloning={!!clonedBudget}
        isLoading={isPending}
      />
    </Loader>
  )
};

export default CreateBudget;
