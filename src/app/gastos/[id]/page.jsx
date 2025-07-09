"use client";
import { useUserContext } from "@/User";
import { useActiveExpense, useDeleteExpense, useEditExpense, useGetExpense, useInactiveExpense } from "@/api/expenses";
import { Flex, Message, MessageHeader } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import { ModalAction, UnsavedChangesModal } from "@/common/components/modals";
import { ACTIVE, COLORS, DELETE, ICONS, INACTIVE, PAGES } from "@/common/constants";
import { isItemCancelled, isItemInactive } from "@/common/utils";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useAllowUpdate, useProtectedAction, useUnsavedChanges, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Tab } from "semantic-ui-react";

const Expense = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: expense, isLoading, refetch } = useGetExpense(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const editExpense = useEditExpense();
  const deleteExpense = useDeleteExpense();
  const activeExpense = useActiveExpense();
  const inactiveExpense = useInactiveExpense();
  const reasonInputRef = useRef(null);
  const formRef = useRef(null);

  const {
    showModal: showUnsavedModal,
    handleDiscard,
    handleSave,
    resolveSave,
    handleCancel,
    isSaving,
    onBeforeView,
    closeModal,
  } = useUnsavedChanges({
    formRef,
    onDiscard: async () => {
      formRef.current?.resetForm();
      setIsUpdating(false);
    },
    onSave: () => {
      formRef.current?.submitForm();
    },
  });

  const { isUpdating, toggleButton, setIsUpdating } = useAllowUpdate({
    canUpdate: RULES.canUpdate[role],
    onBeforeView,
  });
  const { handleProtectedAction } = useProtectedAction({ formRef, onBeforeView });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.EXPENSES.NAME, expense?.name]);
    refetch();
  }, [setLabels, expense, refetch]);

  const modalConfig = useMemo(() => ({
    delete: {
      header: `¿Está seguro que desea eliminar el gasto "${expense?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    active: {
      header: `¿Está seguro que desea activar el gasto ${expense?.id}?`,
      icon: ICONS.PLAY_CIRCLE
    },
    inactive: {
      header: `¿Está seguro que desea desactivar el gasto ${expense?.id}?`,
      icon: ICONS.PAUSE_CIRCLE
    },
  }), [expense]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setReason("");
  };

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: editExpense,
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Gasto actualizado!");
        setIsUpdating(false);
        resolveSave();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
      closeModal();
    },
  });

  const { mutate: mutateActive, isPending: isActivePending } = useMutation({
    mutationFn: ({ expense }) => activeExpense(expense),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Gasto activado!");
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateInactive, isPending: isInactivePending } = useMutation({
    mutationFn: ({ expense, reason }) => inactiveExpense(expense, reason),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Gasto desactivado!");
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: () => deleteExpense(params.id),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Gasto eliminado permanentemente!");
        push(PAGES.EXPENSES.BASE);
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const handleActionConfirm = async () => {
    if (modalAction === INACTIVE && !reason) {
      toast.error("Debe proporcionar una razón para desactivar al gasto.");
      return;
    }

    setActiveAction(modalAction);

    if (modalAction === DELETE) {
      mutateDelete();
    }

    if (modalAction === INACTIVE) {
      mutateInactive({ expense, reason });
    }

    if (modalAction === ACTIVE) {
      mutateActive({ expense });
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === DELETE;

  useEffect(() => {
    const handleClick = (action) => () => handleProtectedAction(() => {
      setModalAction(action);
      setIsModalOpen(true);
    });

    if (expense) {
      const actions = RULES.canRemove[role] ? [
        {
          id: 1,
          icon: isItemInactive(expense?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          onClick: handleClick(isItemInactive(expense?.state) ? ACTIVE : INACTIVE),
          text: isItemInactive(expense.state) ? "Activar" : "Desactivar",
          loading: (activeAction === ACTIVE || activeAction === INACTIVE),
          disabled: !!activeAction,
          width: "fit-content",
        },
        {
          id: 2,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: handleClick(DELETE),
          text: "Eliminar",
          basic: true,
          loading: activeAction === DELETE,
          disabled: !!activeAction,
        },
      ] : [];

      setActions(actions);
    }
  }, [role, expense, activeAction, isActivePending, isInactivePending, isDeletePending, setActions]);

  if (!isLoading && !expense) {
    push(PAGES.NOT_FOUND.BASE);
  }

  const panes = [
    {
      menuItem: "Gasto",
      render: () => (
        <Tab.Pane>
          <Flex $marginBottom="15px">
            {!isItemCancelled(expense?.state) && toggleButton}
          </Flex>
          {isItemCancelled(expense?.state) && (
            <Message negative>
              <MessageHeader>Motivo de cancelación</MessageHeader>
              <p>{expense.cancelReason}</p>
            </Message>
          )}
          <ExpenseForm
            ref={formRef}
            expense={expense}
            onSubmit={mutateEdit}
            isLoading={isEditPending}
            isUpdating={isUpdating && !isItemCancelled(expense?.state)}
            view
            isDeletePending={isDeletePending}
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Pagos",
      render: () => (
        <Tab.Pane>
          <></>
        </Tab.Pane>
      ),
    },
  ];

  return (
    <Loader active={isLoading}>
      <Tab panes={panes} />
      <UnsavedChangesModal
        open={showUnsavedModal}
        onDiscard={handleDiscard}
        onSave={handleSave}
        isSaving={isSaving}
        onCancel={handleCancel}
      />
      <ModalAction
        title={header}
        onConfirm={handleActionConfirm}
        confirmationWord={requiresConfirmation ? confirmText : ""}
        confirmButtonIcon={icon}
        showModal={isModalOpen}
        setShowModal={handleModalClose}
        isLoading={isDeletePending || isInactivePending || isActivePending}
        noConfirmation={!requiresConfirmation}
        disableButtons={!reason && modalAction === INACTIVE}
        reasonInputRef={reasonInputRef}
        bodyContent={
          modalAction === INACTIVE && (
            <TextField
              ref={reasonInputRef}
              placeholder="Motivo"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )
        }
      />
    </Loader>
  );
};

export default Expense;