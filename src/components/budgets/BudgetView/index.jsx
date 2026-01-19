import { useConfirmBudgetDiscount } from "@/api/budgets";
import { useCreatePayment, useDeletePayment, useEditPayment } from "@/api/payments";
import { ENTITIES } from "@/common/constants";
import BudgetDetails from "@/components/budgets/BudgetView/BudgetDetails";
import { Loader } from "@/components/layout";
import Payments from "@/components/payments";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Tab } from "semantic-ui-react";
import { isBudgetCancelled, isBudgetExpired, isBudgetPending } from "../budgets.utils";

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
  refetchPayments,
}) => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTabIndex = tabParam === "pagos" ? 1 : 0;
  const [activeIndex, setActiveIndex] = useState(initialTabIndex);
  const router = useRouter();
  const editPayment = useEditPayment();
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const confirmBudgetDiscount = useConfirmBudgetDiscount();
  const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutate: mutateCreatePayment, isPending: isCreatePending } = useMutation({
    mutationFn: (payment) => createPayment(payment, ENTITIES.BUDGET, budget.id),
    onSuccess: (response) => {
      if (response?.statusOk) {
        toast.success("Pago creado correctamente!");
        refetchPayments();
        refetch();
      } else {
        toast.error(response.error.message);
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
        refetchPayments();
        refetch();
      } else {
        toast.error(response.error.message);
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
        refetchPayments();
        refetch();
      } else {
        toast.error(response.error.message);
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
      ]
      : []),
  ];

  const panes = modules.map((mod) => ({
    menuItem: mod.label,
    render: () => <Tab.Pane>{mod.component}</Tab.Pane>,
  }));

  const handleTabChange = async (_, { activeIndex }) => {
    setActiveIndex(activeIndex);
    const newUrl = window.location.pathname;
    router.replace(newUrl);
  };

  return (
    <Tab
      panes={panes}
      activeIndex={activeIndex}
      onTabChange={handleTabChange}
    />
  );
};

export default BudgetView;
