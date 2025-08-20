"use client";
import { useUserContext } from "@/User";
import { useCancelExpense, useEditExpense, useGetExpense, useUpdatePayments } from "@/api/expenses";
import { Flex, Message, MessageHeader } from "@/common/components/custom";
import { UnsavedChangesModal } from "@/common/components/modals";
import ModalCancel from "@/common/components/modals/ModalCancel";
import EntityPayments from "@/common/components/modules/EntityPayments";
import { COLORS, ICONS, PAGES } from "@/common/constants";
import { isItemCancelled } from "@/common/utils";
import { now } from "@/common/utils/dates";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useAllowUpdate, useProtectedAction, useUnsavedChanges, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Tab } from "semantic-ui-react";

const Expense = ({ params }) => {
  useValidateToken();
  const { role, userData } = useUserContext();
  const { push } = useRouter();
  const { data: expense, isLoading, refetch } = useGetExpense(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const cancelExpense = useCancelExpense();
  const editExpense = useEditExpense();
  const updatePayment = useUpdatePayments();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.EXPENSES.NAME, expense?.name]);
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

    const actionsList = RULES.canRemove[role] ? [
      {
        id: 1,
        icon: ICONS.COPY,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.EXPENSES.CLONE(expense.id)) },
        text: 'Clonar',
      },
    ] : [];
    if (!isItemCancelled(expense?.state)) {
      actionsList.push({
        id: 2,
        icon: ICONS.BAN,
        color: COLORS.RED,
        basic: true,
        onClick: () => handleProtectedAction(() => setIsModalCancelOpen(true)),
        text: "Anular",
        width: "fit-content",
      });
    }
    setActions(actionsList);
  }, [role, expense, push]);

  const expenseFormRef = useRef();

  const expenseUnsaved = useUnsavedChanges({
    formRef: expenseFormRef,
    onSave: () => expenseFormRef.current.submitForm(),
    onDiscard: () => expenseFormRef.current.resetForm(),
  });

  const expenseAllow = useAllowUpdate({ canUpdate: RULES.canUpdate[role], onBeforeView: expenseUnsaved.onBeforeView });

  const paymentsFormRef = useRef();
  const paymentMethods = useForm({
    defaultValues: { paymentsMade: expense?.paymentsMade || [] },
    mode: "onChange",
  });

  const { formState: { isDirty: isPaymentsDirty } } = paymentMethods;

  useEffect(() => {
    if (expense?.paymentsMade && !isPaymentsDirty) {
      paymentMethods.reset({ paymentsMade: expense.paymentsMade });
    }
  }, [expense?.paymentsMade, isPaymentsDirty, paymentMethods]);

  const paymentsUnsaved = useUnsavedChanges({
    formRef: paymentsFormRef,
    onSave: () => paymentsFormRef.current.submitForm(),
    onDiscard: () => paymentsFormRef.current.resetForm(),
  });
  const paymentsAllow = useAllowUpdate({ canUpdate: RULES.canUpdate[role], onBeforeView: paymentsUnsaved.onBeforeView })

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

  const { mutate: mutateUpdatePayment, isPending: isLoadingUpdatePayment } = useMutation({
    mutationFn: async () => {
      const formData = paymentsFormRef.current.getValues();
      const updatedExpense = {
        ...expense,
        paymentsMade: formData.paymentsMade,
        updatedAt: now(),
      };
      const data = await updatePayment({ expense: updatedExpense, id: expense.id });
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Pagos actualizados!");
        paymentsFormRef.current.resetForm();
        paymentsAllow.setIsUpdating(false);
        paymentsUnsaved.resolveSave();
        refetch();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => paymentsUnsaved.closeModal(),
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
          {isItemCancelled(expense?.state) && (
            <Message negative>
              <MessageHeader>Motivo de cancelación</MessageHeader>
              <p>{expense.cancelledMsg}</p>
            </Message>
          )}
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
          <EntityPayments
            ref={paymentsFormRef}
            total={expense.amount}
            entityState={expense.state}
            isCancelled={isItemCancelled}
            isUpdating={paymentsAllow.isUpdating}
            toggleButton={paymentsAllow.toggleButton}
            methods={paymentMethods}
            onSubmit={mutateUpdatePayment}
            isLoading={isLoadingUpdatePayment}
            isDirty={isPaymentsDirty}
            resetValue={{ paymentsMade: expense.paymentsMade }}
            dueDate={expense.expirationDate}
          />
          <UnsavedChangesModal
            open={paymentsUnsaved.showModal}
            onSave={paymentsUnsaved.handleSave}
            onDiscard={paymentsUnsaved.handleDiscard}
            isSaving={paymentsUnsaved.isSaving}
            onCancel={paymentsUnsaved.handleCancel}
          />
        </Tab.Pane>
      ),
    },
  ];

  const handleTabChange = async (_, { activeIndex }) => {
    if (await expenseUnsaved.onBeforeView() && await paymentsUnsaved.onBeforeView()) {
      setActiveIndex(activeIndex);
    }
  };

  return (
    <Loader active={isLoading}>
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