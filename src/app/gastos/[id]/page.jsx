"use client";
import { useUserContext } from "@/User";
import { useCancelExpense, useEditExpense, useGetExpense } from "@/api/expenses";
import { useCreatePayment, useDeletePayment, useEditPayment, useGetPayments } from "@/api/payments";
import { Flex, Message, MessageHeader } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import { UnsavedChangesModal } from "@/common/components/modals";
import ModalCancel from "@/common/components/modals/ModalCancel";
import { COLORS, DATE_FORMATS, ENTITIES, ICONS, PAGES } from "@/common/constants";
import { isItemCancelled } from "@/common/utils";
import { getFormatedDate, isDateAfter, now } from "@/common/utils/dates";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useAllowUpdate, useProtectedAction, useUnsavedChanges, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Tab } from "semantic-ui-react";
import Payments from "@/components/payments";

const Expense = ({ params }) => {
  useValidateToken();
  const { role, userData } = useUserContext();
  const { push } = useRouter();
  const { data: expense, isLoading, refetch } = useGetExpense(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTabIndex = tabParam === "pagos" ? 1 : 0;
  const [activeIndex, setActiveIndex] = useState(initialTabIndex);
  const { data: payments, refetch: refetchPayments, isLoading: isLoadingPayments, isRefetching } = useGetPayments(ENTITIES.EXPENSE, params.id);
  const cancelExpense = useCancelExpense();
  const editExpense = useEditExpense();
  const editPayment = useEditPayment();
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.EXPENSES.NAME }, { name: expense?.name }]);
    refetch();
  }, [setLabels, expense, refetch]);

  const { handleProtectedAction } = useProtectedAction({
    onBeforeView: async () => {
      const expenseOk = await expenseUnsaved.onBeforeView?.();
      const paymentsOk = await paymentsUnsaved.onBeforeView?.();
      return expenseOk && paymentsOk;
    },
  });

  useEffect(() => {
    const actionsList = [];

    if (RULES.canRemove[role]) {
      actionsList.push({
        id: 1,
        icon: ICONS.COPY,
        color: COLORS.GREEN,
        onClick: () => push(PAGES.EXPENSES.CLONE(expense.id)),
        text: 'Clonar',
      });
    }

    if (!isItemCancelled(expense?.state)) {
      const handleAnular = () => handleProtectedAction(() => setIsModalCancelOpen(true));

      actionsList.push({
        id: 2,
        icon: ICONS.BAN,
        color: COLORS.RED,
        basic: true,
        onClick: handleAnular,
        text: "Anular",
        width: "fit-content",
      });
    }

    setActions(actionsList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, expense?.id, expense?.state, setActions, push]);

  const expenseFormRef = useRef();

  const expenseUnsaved = useUnsavedChanges({
    formRef: expenseFormRef,
    onSave: () => expenseFormRef.current.submitForm(),
    onDiscard: () => expenseFormRef.current.resetForm(),
  });

  const expenseAllow = useAllowUpdate({ canUpdate: RULES.canUpdate[role], onBeforeView: expenseUnsaved.onBeforeView });

  const paymentsFormRef = useRef();

  const paymentsUnsaved = useUnsavedChanges({
    formRef: paymentsFormRef,
    onSave: () => paymentsFormRef.current.submitForm(),
    onDiscard: () => paymentsFormRef.current.resetForm(),
  });

  const handleModalClose = () => {
    setIsModalCancelOpen(false);
  };

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: editExpense,
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Gasto actualizado!");
        expenseAllow.setIsUpdating(false);
        expenseUnsaved.resolveSave();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      handleModalClose();
      expenseUnsaved.closeModal();
    },
  });

  const { mutate: mutateCancel, isPending: isCancelPending } = useMutation({
    mutationFn: (cancelReason) => {
      const cancelData = {
        cancelledBy: `${userData.name}`,
        cancelledAt: now(),
        cancelledMsg: cancelReason
      };
      return cancelExpense({ cancelData, id: expense?.id });
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Gasto anulado!');
        setIsModalCancelOpen(false);
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(`Error al anular: ${error.message}`);
    }
  });

  const { mutate: mutateCreatePayment, isPending: isCreatePending } = useMutation({
    mutationFn: (payment) => createPayment(payment, ENTITIES.EXPENSE, expense.id),
    onSuccess: (response) => {
      if (response?.statusOk) {
        toast.success("Pago creado correctamente!");
        refetchPayments();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setIsModalPaymentOpen(false);
    }
  });

  const { mutate: mutateEditPayment, isPending: isEditPaymentPending } = useMutation({
    mutationFn: (payment) => editPayment(payment, ENTITIES.EXPENSE, expense.id),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Pago actualizado!");
        refetchPayments();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setIsModalPaymentOpen(false);
    }
  });

  const { mutate: mutateDeletePayment, isPending: isDeletePending } = useMutation({
    mutationFn: (paymentId) => deletePayment(paymentId, ENTITIES.EXPENSE,expense.id),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Pago eliminado!");
        refetchPayments();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setShowDeleteModal(false)
    }
  });

  const handleModalCancelClose = () => {
    setIsModalCancelOpen(false);
  };

  const panes = [
    {
      menuItem: "Gasto",
      render: () => (
        <Tab.Pane>
          <Flex $marginBottom="15px">
            {!isItemCancelled(expense?.state) && expenseAllow.toggleButton}
          </Flex>
          <ExpenseForm
            ref={expenseFormRef}
            expense={expense}
            onSubmit={mutateEdit}
            isLoading={isEditPending}
            isUpdating={expenseAllow.isUpdating && !isItemCancelled(expense?.state)}
            view
          />
          <UnsavedChangesModal
            open={expenseUnsaved.showModal}
            onSave={expenseUnsaved.handleSave}
            onDiscard={expenseUnsaved.handleDiscard}
            isSaving={expenseUnsaved.isSaving}
            onCancel={expenseUnsaved.handleCancel}
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Pagos",
      render: () => (
        <Tab.Pane>
          <Loader active={isLoadingPayments || isRefetching}>
            {!isItemCancelled(expense?.state) && expense.expirationDate && (
              <Flex $justifyContent="space-between">
                <TextField
                  width="20%"
                  value={getFormatedDate(expense.expirationDate, DATE_FORMATS.ONLY_DATE)}
                  label="Fecha de Vencimiento"
                  disabled
                />
              </Flex>
            )}
            <Payments
              payments={payments.map(payment => ({ ...payment, isOverdue: isDateAfter(payment.date, expense.expirationDate) })) ?? []}
              isModalPaymentOpen={isModalPaymentOpen}
              setIsModalPaymentOpen={setIsModalPaymentOpen}
              showDeleteModal={showDeleteModal}
              setShowDeleteModal={setShowDeleteModal}
              total={expense.amount}
              isLoading={isDeletePending || isCreatePending || isEditPaymentPending}
              onAdd={(payment) => mutateCreatePayment(payment)}
              onEdit={(payment) => mutateEditPayment(payment)}
              onDelete={(payment) => {
                mutateDeletePayment(payment.id);
              }}
              allowUpdates={!isItemCancelled(expense?.state)}
            />
          </Loader>
        </Tab.Pane>
      ),
    },
  ];

  const handleTabChange = async (_, { activeIndex }) => {
    if (await expenseUnsaved.onBeforeView() && await paymentsUnsaved.onBeforeView()) {
      setActiveIndex(activeIndex);
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  };

  if (!isLoading && !expense) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || !expense}>
      {isItemCancelled(expense?.state) && (
        <Message negative>
          <MessageHeader>Motivo de cancelación</MessageHeader>
          <p>{expense.cancelledMsg}</p>
        </Message>
      )}
      <Tab
        panes={panes}
        activeIndex={activeIndex}
        onTabChange={handleTabChange}
      />
      <ModalCancel
        isModalOpen={isModalCancelOpen}
        onClose={handleModalCancelClose}
        onConfirm={mutateCancel}
        isLoading={isCancelPending}
        id={expense?.id}
        header={`Desea anular el gasto ${expense?.name}?`}
      />
    </Loader>
  );
};

export default Expense;