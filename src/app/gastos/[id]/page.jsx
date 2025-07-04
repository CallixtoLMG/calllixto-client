"use client";
import { useUserContext } from "@/User";
import { useActiveExpense, useDeleteExpense, useEditExpense, useGetExpense, useInactiveExpense } from "@/api/expenses";
import { Input } from "@/common/components/custom";
import { ModalAction } from "@/common/components/modals";
import { COLORS, ICONS, PAGES } from "@/common/constants";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useAllowUpdate, useValidateToken } from "@/hooks";

import { isItemInactive } from "@/common/utils";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const Expense = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: expense, isLoading, refetch } = useGetExpense(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { isUpdating, toggleButton } = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const editExpense = useEditExpense();
  const deleteExpense = useDeleteExpense();
  const activeExpense = useActiveExpense();
  const inactiveExpense = useInactiveExpense();

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

  const handleOpenModalWithAction = useCallback((action) => {
    setModalAction(action);
    setIsModalOpen(true);
  }, []);

  const handleActivateClick = useCallback(() => handleOpenModalWithAction("active"), [handleOpenModalWithAction]);
  const handleInactiveClick = useCallback(() => handleOpenModalWithAction("inactive"), [handleOpenModalWithAction]);
  const handleDeleteClick = useCallback(() => handleOpenModalWithAction("delete"), [handleOpenModalWithAction]);

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: async (expense) => {
      const data = await editExpense(expense);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Gasto actualizado!");
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateActive, isPending: isActivePending } = useMutation({
    mutationFn: async ({ expense }) => {
      const response = await activeExpense(expense);
      return response;
    },
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
    mutationFn: async ({ expense, reason }) => {
      const response = await inactiveExpense(expense, reason);
      return response;
    },
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
    mutationFn: () => {
      return deleteExpense(params.id);
    },
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
    setActiveAction(modalAction);

    if (modalAction === "delete") {
      mutateDelete();
    } else if (modalAction === "inactive") {
      if (!reason) {
        toast.error("Debe proporcionar una razón para desactivar el gasto.");
        return;
      }
      mutateInactive({ expense, reason });
    } else if (modalAction === "active") {
      mutateActive({ expense });
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === "delete";

  useEffect(() => {
    if (expense) {
      const actions = RULES.canRemove[role] ? [
        {
          id: 1,
          icon: isItemInactive(expense?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          text: isItemInactive(expense?.state) ? "Activar" : "Desactivar",
          onClick: isItemInactive(expense?.state) ? handleActivateClick : handleInactiveClick,
          loading: (activeAction === "active" || activeAction === "inactive"),
          disabled: !!activeAction,
          width: "fit-content",
        },
        {
          id: 2,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          text: "Eliminar",
          basic: true,
          onClick: handleDeleteClick,
          loading: activeAction === "delete",
          disabled: !!activeAction,
        },
      ] : [];

      setActions(actions);
    }
  }, [role, expense, activeAction, isActivePending, isInactivePending, isDeletePending, handleActivateClick, handleInactiveClick, handleDeleteClick, setActions]);

  if (!isLoading && !expense) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading}>
      {!isItemInactive(expense?.state) && toggleButton}
      {isItemInactive(expense?.state) && (
        <Message negative>
          <MessageHeader>Motivo de inactivación</MessageHeader>
          <p>{expense.inactiveReason}</p>
        </Message>
      )}
      <ExpenseForm
        expense={expense}
        onSubmit={mutateEdit}
        isLoading={isEditPending}
        isUpdating={isUpdating && !isItemInactive(expense?.state)}
        view
        isDeletePending={isDeletePending}
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
        disableButtons={!reason && modalAction === "inactive"}
        bodyContent={
          modalAction === "inactive" && (
            <Input
              type="text"
              placeholder="Indique la razón de desactivación"
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