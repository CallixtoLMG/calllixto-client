"use client";
import { useUserContext } from "@/User";
import { LIST_BUDGETS_QUERY_KEY, create, useGetBudget } from "@/api/budgets";
import { edit, useListCustomers } from "@/api/customers";
import { useListProducts } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
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

  const { data: productsData, isLoading: loadingProducts } = useListProducts({ cache: false, pageSize: "100000" });
  const { data: customersData, isLoading: loadingCustomers } = useListCustomers({ order: true });
  const { data: budget, isLoading: loadingBudget } = useGetBudget(cloneId);

  const { products } = useMemo(() => {
    return { products: productsData?.products }
  }, [productsData]);

  const { customers } = useMemo(() => {
    return { customers: customersData?.customers }
  }, [customersData]);

  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Presupuestos', 'Crear']);
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
      const { data } = await create(budget);
      return data;
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
        onSubmitCustomer={edit}
        products={mappedProducts}
        customers={mappedCustomers}
        user={userData}
        budget={clonedBudget}
        isLoading={isPending}
      />
    </Loader>
  )
};

export default CreateBudget;
