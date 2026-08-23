import { useConfirmBudgetDiscount } from "@/api/budgets";
import { useCreatePayment, useDeletePayment, useEditPayment } from "@/api/payments";
import { useListStockFlowsByBudget } from "@/api/stock";
import { ENTITIES } from "@/common/constants";
import BudgetDeliveries from "@/components/budgets/BudgetDeliveries";
import DeliveriesHistory from "@/components/budgets/BudgetDeliveries/DeliveriesHistory";
import DeliveriesPrint from "@/components/budgets/BudgetDeliveries/DeliveriesPrint";
import BudgetDetails from "@/components/budgets/BudgetView/BudgetDetails";
import { Loader, OnlyPrint } from "@/components/layout";
import Payments from "@/components/payments";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Tab } from "semantic-ui-react";
import { FlexColumn } from "../../../common/components/custom";
import { mapBudgetToDeliveryForm, mapStockFlowsToHistory } from "../budgets.constants";
import { isBudgetCancelled, isBudgetConfirmed, isBudgetExpired, isBudgetPending } from "../budgets.utils";

const BudgetView = ({
  budget,
  subtotal,
  subtotalAfterDiscount,
  total,
  selectedContact,
  setSelectedContact,
  refetch,
  paymentsMade,
  isLoadingPayments,
  activeIndex,
  onTabChange,
}) => {
  const editPayment = useEditPayment();
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const confirmBudgetDiscount = useConfirmBudgetDiscount();
  const deliveriesPrintRef = useRef();
  const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data: stockFlowsByBudget, isLoading: isLoadingStockFlowsByBudget } = useListStockFlowsByBudget({ budgetId: budget.id });

  const stockFlowsByBudgetHistory = useMemo(
    () => mapStockFlowsToHistory(stockFlowsByBudget ?? []),
    [stockFlowsByBudget]
  );

  const methods = useForm({
    defaultValues: undefined,
    shouldUnregister: false,
  });

  const handlePrintDeliveries = useReactToPrint({
    content: () => deliveriesPrintRef.current,
    removeAfterPrint: true,
  });

  const canPrintDeliveries = isBudgetConfirmed(budget?.state) && !!stockFlowsByBudgetHistory.length;

  const { mutate: mutateCreatePayment, isPending: isCreatePending } = useMutation({
    mutationFn: (payment) => createPayment(payment, ENTITIES.BUDGET, budget.id),
    onSuccess: (response) => {
      if (response?.statusOk) {
        toast.success("Pago creado correctamente!");
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }
    },
    onSettled: () => {
      setIsModalPaymentOpen(false);
    }
  });

  const { mutate: mutateEditPayment, isPending: isEditPending } = useMutation({
    mutationFn: (payment) => editPayment(payment, ENTITIES.BUDGET, budget.id),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Pago actualizado!");
        refetch();
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }
    },
    onSettled: () => {
      setIsModalPaymentOpen(false);
    }
  });

  const { mutate: mutateDeletePayment, isPending: isDeletePending } = useMutation({
    mutationFn: (paymentId) => deletePayment(paymentId, ENTITIES.BUDGET, budget.id),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Pago eliminado!");
        refetch();
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }
    },
    onSettled: () => {
      setShowDeleteModal(false)
    }
  });

  const { mutate: mutateConfirmBudgetDiscount, isPending: isConfirmBudgetDiscountPending } = useMutation({
    mutationFn: ({ budgetId, postConfirmDiscount }) => confirmBudgetDiscount({ id: budgetId, postConfirmDiscount }),
    onSuccess: (response) => {
      if (response?.statusOk) {
        toast.success("Descuento aplicado correctamente!");
        refetch();
      } else {
        toast.error(response?.error?.message || "Error al aplicar descuento!.");
      }
    },
  });

  const modules = [
    {
      key: "main",
      label: "Presupuesto",
      component: (
        <BudgetDetails
          budget={budget}
          subtotal={subtotal}
          subtotalAfterDiscount={subtotalAfterDiscount}
          total={total}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          onConfirmBudgetDiscount={mutateConfirmBudgetDiscount}
          isLoading={isConfirmBudgetDiscountPending}
        />
      ),
    },
    ...(!isBudgetPending(budget?.state) && !isBudgetExpired(budget?.state)
      ? [
        {
          key: "payments",
          label: "Pagos",
          component: (
            <Loader active={isLoadingPayments}>
              <Payments
                payments={paymentsMade}
                isModalPaymentOpen={isModalPaymentOpen}
                setIsModalPaymentOpen={setIsModalPaymentOpen}
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                total={total}
                isLoading={isCreatePending || isDeletePending || isEditPending}
                onAdd={(payment) => mutateCreatePayment(payment)}
                onEdit={(payment) => mutateEditPayment(payment)}
                onDelete={(payment) => mutateDeletePayment(payment.id)}
                allowUpdates={!isBudgetCancelled(budget?.state)}
              />
            </Loader>
          ),
        },
        {
          key: "deliveries",
          label: "Entregas",
          component: (
            <FlexColumn $rowGap="15px">
              <Loader active={isLoadingStockFlowsByBudget}>
                <BudgetDeliveries
                  onSuccess={refetch}
                  budgetId={budget.id}
                  state={budget.state}
                  canPrint={canPrintDeliveries}
                  onPrint={() => setTimeout(handlePrintDeliveries)}
                />
                {!!stockFlowsByBudgetHistory.length && (
                  <>
                    <DeliveriesHistory history={stockFlowsByBudgetHistory} />
                    <OnlyPrint>
                      <DeliveriesPrint
                        ref={deliveriesPrintRef}
                        budget={budget}
                        history={stockFlowsByBudgetHistory}
                      />
                    </OnlyPrint>
                  </>
                )}
              </Loader>
            </FlexColumn>
          ),
        },
      ]
      : []),
  ];

  useEffect(() => {
    if (!budget) return;

    methods.reset(mapBudgetToDeliveryForm(budget));
  }, [budget, methods]);

  const panes = modules.map((mod) => ({
    menuItem: {
      key: mod.key,
      content: mod.label,
      "data-testid": `budget-detail-tab-${mod.key}`,
    },
    render: () => <Tab.Pane>{mod.component}</Tab.Pane>,
  }));

  return (
    <FormProvider {...methods}>
      <Tab
        panes={panes}
        activeIndex={activeIndex}
        onTabChange={onTabChange}
      />
    </FormProvider>
  );
};

export default BudgetView;
