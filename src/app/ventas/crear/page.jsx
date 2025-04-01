"use client";
import { useUserContext } from "@/User";
import { useCreateBudget, useGetBudget } from "@/api/budgets";
import { useListCustomers } from "@/api/customers";
import { useListProducts } from "@/api/products";
import { PAGES } from "@/common/constants";
import BudgetForm from "@/components/budgets/BudgetForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PRODUCT_STATES } from "@/components/products/products.constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { v4 as uuid } from 'uuid';

const CreateBudget = () => {
  useValidateToken();
  const { userData } = useUserContext();
  const searchParams = useSearchParams();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const createBudget = useCreateBudget();
  const cloneId = searchParams.get('clonar');
  const { push } = useRouter();
  const { data: productsData, isLoading: loadingProducts, refetch, isRefetching } = useListProducts();
  const { data: customersData, isLoading: loadingCustomers } = useListCustomers();
  const { data: budget, isLoading: loadingBudget } = useGetBudget(cloneId);
  const products = useMemo(() => productsData?.products.filter((product) => ![PRODUCT_STATES.DELETED.id, PRODUCT_STATES.INACTIVE.id].some(state => state === product.state)), [productsData]);
  const customers = useMemo(() => customersData?.customers, [customersData]);

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.BUDGETS.NAME, 'Crear']);
    refetch();
  }, [setLabels, refetch]);

  const mappedProducts = useMemo(() => products?.map(product => ({
    ...product,
    key: product.code,
    value: product.name,
    text: product.name,
  })), [products]);

  const { mutate, isPending } = useMutation({
    mutationFn: createBudget,
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.BUDGETS.SHOW(response.budget.id))
        toast.success('Presupuesto creado!');
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const clonedBudget = useMemo(() => {
    if (budget) {
      const { customer, id, ...clonedBudget } = budget;
      clonedBudget.products = clonedBudget.products.map((product) => ({
        ...product, key: uuid(),
      }))
      return clonedBudget;
    }
  }, [budget]);

  return (
    <Loader active={loadingProducts || loadingCustomers || loadingBudget || isRefetching}>
      <BudgetForm
        onSubmit={mutate}
        products={mappedProducts}
        customers={customers}
        user={userData}
        budget={clonedBudget}
        isCloning={!!clonedBudget}
        isLoading={isPending}
        refetchProducts={refetch}
      />
    </Loader>
  )
};

export default CreateBudget;
