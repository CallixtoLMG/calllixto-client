"use client";

import { useUserContext } from "@/User";
import { useCreateBudget, useGetBudget } from "@/api/budgets";
import { useListCustomers } from "@/api/customers";
import { useListProducts } from "@/api/products";
import { useGetSetting } from "@/api/settings";
import { useConsumeStock } from "@/api/stock";
import { UnsavedChangesModal } from "@/common/components/modals";
import { ENTITIES, PAGES } from "@/common/constants";
import { mapToDropdownOptions } from "@/common/utils";
import BudgetForm from "@/components/budgets/BudgetForm";
import CreateBudgetDeliveriesForm from "@/components/budgets/CreateBudgetDeliveriesForm";
import { BUDGET_STATES, buildConsumeStockFlows, createClonedBudget, createEmptyBudget } from "@/components/budgets/budgets.constants";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import CreateBudgetPayments from "@/components/payments/CreateBudgetPayment";
import { PRODUCT_STATES } from "@/components/products/products.constants";
import { useBudgetTotals, useUnsavedChanges } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Tab } from "semantic-ui-react";

const CreateBudget = () => {
  const { userData } = useUserContext();
  const searchParams = useSearchParams();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { push } = useRouter();
  const createBudget = useCreateBudget();
  const consumeStock = useConsumeStock();
  const { data: productsData, isLoading: loadingProducts, refetch: refetchProductsData, isRefetching } = useListProducts();
  const { data: customersData, isLoading: loadingCustomers } = useListCustomers();
  const { data: paymentMethods, refetch: refetchPaymentMethods } = useGetSetting(ENTITIES.GENERAL);
  const { data: budgetSettings, isLoading: isLoadingBudgetSettings, isRefetching: isRefetchingSettings } = useGetSetting(ENTITIES.BUDGET);
  const cloneId = searchParams.get("clonar");
  const { data: budget, isLoading: loadingBudget } = useGetBudget(cloneId);

  const createBudgetMutation = useMutation({ mutationFn: createBudget, });
  const consumeStockMutation = useMutation({ mutationFn: consumeStock, });

  const isLoading = createBudgetMutation.isPending || consumeStockMutation.isPending;

  const isCloning = Boolean(cloneId);
  const isDraft = Boolean(budget && !cloneId);

  const EXCLUDED_STATES = useMemo(
    () => new Set([PRODUCT_STATES.DELETED.id, PRODUCT_STATES.INACTIVE.id]),
    []
  );

  const products = useMemo(
    () => productsData?.products.filter(p => !EXCLUDED_STATES.has(p.state)) ?? [],
    [productsData, EXCLUDED_STATES]
  );

  const customers = customersData?.customers ?? [];

  const paymentMethodOptions = useMemo(
    () => mapToDropdownOptions(paymentMethods?.paymentMethods || []),
    [paymentMethods]
  );

  const methods = useForm({
    defaultValues: undefined,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });
  const formRef = useRef(null);
  const budgetUnsaved = useUnsavedChanges({
    formRef,
    onDiscard: () => methods.reset(defaultValues),
  });

  const clonedDefaults = useMemo(() => {
    if (!isCloning || !budget) return null;

    return createClonedBudget({
      budget,
      user: userData,
      paymentMethods: paymentMethodOptions,
    });
  }, [isCloning, budget, paymentMethodOptions, userData]);

  const draftDefaults = useMemo(() => {
    if (!isDraft || !budget) return null;

    return {
      ...budget,
      createdBy: userData?.name,
      paymentsMade: budget.paymentsMade || [],
    };
  }, [isDraft, budget, userData?.name]);

  const emptyDefaults = useMemo(() => {
    if (isCloning || isDraft) return null;
    if (!paymentMethodOptions?.length) return null;

    return {
      ...createEmptyBudget(userData),
      ...budgetSettings?.defaultsCreate,
      paymentMethods: paymentMethodOptions.map(m => m.value),
    };
  }, [paymentMethodOptions, budgetSettings?.defaultsCreate, isCloning, isDraft, userData]);

  const defaultValues = clonedDefaults || draftDefaults || emptyDefaults;

  const hasResetRef = useRef(false);

  useEffect(() => {
    formRef.current = {
      isDirty: () => methods.formState.isDirty,
      resetForm: () => methods.reset(defaultValues),
    };
  }, [defaultValues, methods]);

  useEffect(() => {
    if (!defaultValues) return;
    if (hasResetRef.current) return;

    methods.reset(defaultValues);
    hasResetRef.current = true;
  }, [defaultValues, methods]);

  const watchProducts = useWatch({ control: methods.control, name: "products", });
  const watchGlobalDiscount = useWatch({ control: methods.control, name: "globalDiscount", });
  const watchAdditionalCharge = useWatch({ control: methods.control, name: "additionalCharge", });
  const watchState = useWatch({ control: methods.control, name: "state", });

  const isConfirmed = watchState === BUDGET_STATES.CONFIRMED.id;

  const { subtotal, subtotalAfterDiscount, total } = useBudgetTotals({
    products: watchProducts,
    globalDiscount: watchGlobalDiscount,
    additionalCharge: watchAdditionalCharge,
  });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.BUDGETS.NAME }, { name: 'Crear' }]);
    refetchProductsData();
    refetchPaymentMethods();
  }, [setLabels, refetchProductsData, refetchPaymentMethods]);

  const handleCreateBudget = async (data) => {

    try {
      const response = await createBudgetMutation.mutateAsync(data);

      if (!response?.statusOk) {
        toast.error(response?.error?.message || "Error al crear presupuesto");
        return;
      }

      const budgetId = response?.budget?.id;

      if (!budgetId) {
        toast.error("No se pudo obtener el ID del presupuesto");
        return;
      }

      let consumeError = false;

      if (data.state === BUDGET_STATES.CONFIRMED.id) {
        const products = methods.getValues("products");
        const deliveryNote = methods.getValues("deliveryNote");

        const flows = buildConsumeStockFlows(products);

        if (flows.length) {
          const consumeResponse = await consumeStockMutation.mutateAsync({
            budgetId,
            deliveryNote,
            inflow: false,
            flows,
          });

          if (!consumeResponse?.statusOk || consumeResponse?.error) {
            consumeError = true;
          }
        }
      }

      if (consumeError) {
        toast(
          "Presupuesto creado, pero hubo un error al registrar la entrega.",
          { icon: "⚠️" }
        );
      } else {
        toast.success("Presupuesto creado");
      }

      if (
        data.state === BUDGET_STATES.CONFIRMED.id ||
        data.state === BUDGET_STATES.PENDING.id
      ) {
        methods.reset(data);
        budgetUnsaved.runWithoutPrompt(() => push(PAGES.BUDGETS.SHOW(budgetId)));
      } else {
        methods.reset(data);
        budgetUnsaved.runWithoutPrompt(() => push(`${PAGES.BUDGETS.SHOW(budgetId)}/borrador`));
      }

    } catch (error) {
      toast.error(error?.message || "Error inesperado");
    }
  };

  const panes = [
    {
      menuItem: "Venta",
      render: () => (
        <Tab.Pane>
          <BudgetForm
            budget={budget}
            products={products}
            customers={customers}
            user={userData}
            isLoading={isLoading}
            settings={budgetSettings}
            subtotal={subtotal}
            subtotalAfterDiscount={subtotalAfterDiscount}
            total={total}
            isCloning={isCloning}
            isDraft={isDraft}
            paymentMethods={paymentMethodOptions}
            onSubmit={handleCreateBudget}
          />
        </Tab.Pane>
      ),
    },
    ...(isConfirmed
      ? [
        {
          menuItem: "Pagos",
          render: () => (
            <Tab.Pane>
              <CreateBudgetPayments total={total} update noBorder noBoxShadow padding="0px" />
            </Tab.Pane>
          ),
        },
        {
          menuItem: "Entregas",
          render: () => (
            <Tab.Pane>
              <CreateBudgetDeliveriesForm create />
            </Tab.Pane>
          ),
        },
      ]
      : []),
  ];

  return (
    <Loader active={loadingProducts || loadingCustomers || loadingBudget || isRefetching || isLoadingBudgetSettings || isRefetchingSettings}>
      <FormProvider {...methods}>
        <Tab
          panes={panes}
          defaultActiveIndex={0}
        />
        <UnsavedChangesModal
          open={budgetUnsaved.showModal}
          onDiscard={budgetUnsaved.handleDiscard}
          onContinue={budgetUnsaved.handleContinue}
        />
      </FormProvider>
    </Loader>
  )
};

export default CreateBudget;
