"use client";

import { useUserContext } from "@/User";
import { useConfirmBudget, useEditBudget, useGetBudget, } from "@/api/budgets";
import { useListCustomers } from "@/api/customers";
import { useListProducts } from "@/api/products";
import { useGetSetting } from "@/api/settings";
import { useConsumeStock } from "@/api/stock";
import { ENTITIES, PAGES } from "@/common/constants";
import { mapToDropdownOptions } from "@/common/utils";
import BudgetForm from "@/components/budgets/BudgetForm";
import CreateBudgetDeliveriesForm from "@/components/budgets/CreateBudgetDeliveriesForm";
import { BUDGET_STATES, buildConsumeStockFlows, } from "@/components/budgets/budgets.constants";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import CreateBudgetPayments from "@/components/payments/CreateBudgetPayment";
import { PRODUCT_STATES } from "@/components/products/products.constants";
import { useBudgetTotals } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { Tab } from "semantic-ui-react";

const BudgetDraft = ({ params }) => {
  const { id } = params;
  const { userData } = useUserContext();
  const { push } = useRouter();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { data: budget, isLoading: loadingBudget } = useGetBudget(id);
  const { data: productsData, isLoading: loadingProducts, refetch: refetchProductsData, } = useListProducts();
  const { data: customersData, isLoading: loadingCustomers } = useListCustomers();
  const { data: paymentMethods, refetch: refetchPaymentMethods } = useGetSetting(ENTITIES.GENERAL);
  const { data: budgetSettings } = useGetSetting(ENTITIES.BUDGET);
  const editBudget = useEditBudget();
  const confirmBudget = useConfirmBudget();
  const consumeStock = useConsumeStock();

  const editMutation = useMutation({
    mutationFn: (data) => editBudget({ ...data, id }),
    onSuccess: (res) => {
      if (!res?.statusOk) {
        toast.error(res?.error?.message);
      }
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, data }) => confirmBudget(data, id),
  });

  const consumeStockMutation = useMutation({
    mutationFn: consumeStock,
  });

  const isLoading = editMutation.isPending || confirmMutation.isPending || consumeStockMutation.isPending;

  const EXCLUDED_STATES = useMemo(
    () => new Set([PRODUCT_STATES.DELETED.id, PRODUCT_STATES.INACTIVE.id]),
    []
  );

  const products = useMemo(
    () => productsData?.products.filter((p) => !EXCLUDED_STATES.has(p.state)) ?? [],
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

  useEffect(() => {
    if (!budget) return;

    methods.reset({
      ...budget,
      createdBy: userData?.name,
      paymentsMade: budget.paymentsMade || [],
    });
  }, [budget, methods, userData]);

  const watchProducts = useWatch({ control: methods.control, name: "products" });
  const watchGlobalDiscount = useWatch({ control: methods.control, name: "globalDiscount", });
  const watchAdditionalCharge = useWatch({ control: methods.control, name: "additionalCharge", });
  const watchState = useWatch({ control: methods.control, name: "state" });

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
    setLabels([
      { name: PAGES.BUDGETS.NAME },
      { name: id, label: { title: "Borrador", color: BUDGET_STATES.DRAFT.color } },
    ]);
    refetchProductsData();
    refetchPaymentMethods();
  }, [id, setLabels, refetchProductsData, refetchPaymentMethods]);

  const handleSubmitDraft = async (data) => {
    await editMutation.mutateAsync(data);
    toast.success("Presupuesto guardado");

    if (data.state === BUDGET_STATES.DRAFT.id) {
      push(PAGES.BUDGETS.DRAFT(id));
    } else {
      push(PAGES.BUDGETS.SHOW(id));
    }
  };

  const handleConfirm = async (data) => {
    if (data.state !== BUDGET_STATES.CONFIRMED.id) return;

    const response = await confirmMutation.mutateAsync({
      id,
      data: {
        confirmedBy: userData.name,
        confirmedAt: new Date().toISOString(),
        pickUpInStore: data.pickUpInStore,
        paymentsMade: data.paymentsMade,
        total,
      },
    });

    if (!response?.statusOk) {
      toast.error(response?.error?.message);
      return;
    }
    const budgetId = response?.budget?.id;

    const products = methods.getValues("products");
    const deliveryNote = methods.getValues("deliveryNote");

    const flows = buildConsumeStockFlows(products);

    if (flows.length) {
      await consumeStockMutation.mutateAsync({
        budgetId,
        deliveryNote,
        inflow: false,
        flows,
      });
    }

    toast.success("Presupuesto confirmado");
    push(PAGES.BUDGETS.SHOW(id));
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
            isDraft
            paymentMethods={paymentMethodOptions}
            onSubmit={isConfirmed ? handleConfirm : handleSubmitDraft}
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
              <CreateBudgetPayments total={total} update />
            </Tab.Pane>
          ),
        },
        {
          menuItem: "Entregas",
          render: () => (
            <Tab.Pane>
              <CreateBudgetDeliveriesForm />
            </Tab.Pane>
          ),
        },
      ]
      : []),
  ];

  /* ---------------------- Render ------------------------- */

  if (loadingBudget || loadingProducts || loadingCustomers) {
    return <Loader active />;
  }

  return (
    <Loader active={isLoading}>
      <FormProvider {...methods}>
        <Tab
          panes={panes}
          defaultActiveIndex={0} />
      </FormProvider>
    </Loader>
  );
};

export default BudgetDraft;
