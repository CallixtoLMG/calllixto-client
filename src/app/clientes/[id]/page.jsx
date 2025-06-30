"use client";
import { useListBudgets } from "@/api/budgets";
import { useActiveCustomer, useDeleteCustomer, useEditCustomer, useGetCustomer, useInactiveCustomer } from "@/api/customers";
import { Message, MessageHeader } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import ModalAction from "@/common/components/modals/ModalAction";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { ACTIVE, COLORS, DELETE, ICONS, INACTIVE, PAGES } from "@/common/constants";
import { isItemInactive } from "@/common/utils";
import CustomerForm from "@/components/customers/CustomerForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useProtectedAction } from "@/hooks/useProtectedAction";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useUnsavedChanges } from "../../../hooks/unsavedChanges";

const Customer = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { data: customer, isLoading, refetch } = useGetCustomer(params.id);
  const { data: budgetData, isLoading: isLoadingBudgets } = useListBudgets();
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const editCustomer = useEditCustomer();
  const deleteCustomer = useDeleteCustomer();
  const inactiveCustomer = useInactiveCustomer();
  const activeCustomer = useActiveCustomer();
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
    canUpdate: true,
    onBeforeView,
  });
  const { handleProtectedAction } = useProtectedAction({ formRef, onBeforeView });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.CUSTOMERS.NAME, customer?.name]);
    refetch();
  }, [customer, setLabels, refetch]);


  const hasAssociatedBudgets = useMemo(() => {
    return budgetData?.budgets?.some(budget => budget.customer?.id === customer?.id);
  }, [budgetData, customer]);

  const modalConfig = useMemo(() => ({
    delete: {
      header: `¿Está seguro que desea eliminar el cliente ${customer?.id}?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
      color: COLORS.RED
    },
    active: {
      header: `¿Está seguro que desea activar el cliente ${customer?.id}?`,
      icon: ICONS.PLAY_CIRCLE,
      color: COLORS.GREEN
    },
    inactive: {
      header: `¿Está seguro que desea desactivar el cliente ${customer?.id}?`,
      icon: ICONS.PAUSE_CIRCLE,
      color: COLORS.GREY
    },
  }), [customer]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setReason("");
  };

  const handleOpenModalWithAction = useCallback(async (action) => {
    setModalAction(action);
    setIsModalOpen(true);
  }, []);

  const handleActivateClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction(ACTIVE)),
    [handleProtectedAction, handleOpenModalWithAction],
  );

  const handleInactiveClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction(INACTIVE)),
    [handleProtectedAction, handleOpenModalWithAction],
  );

  const handleDeleteClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction(DELETE)),
    [handleProtectedAction, handleOpenModalWithAction],
  );

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: editCustomer,
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Cliente actualizado!");
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
    mutationFn: ({ customer }) => activeCustomer(customer),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Cliente activado!");
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
    mutationFn: ({ customer, reason }) => inactiveCustomer(customer, reason),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Cliente desactivado!");
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
    mutationFn: () => deleteCustomer(params.id),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Cliente eliminado permanentemente!");
        push(PAGES.CUSTOMERS.BASE);
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
      toast.error("Debe proporcionar una razón para desactivar al cliente.");
      return;
    }

    setActiveAction(modalAction);

    if (modalAction === DELETE) {
      mutateDelete();
    }

    if (modalAction === INACTIVE) {
      mutateInactive({ customer, reason });
    }

    if (modalAction === ACTIVE) {
      mutateActive({ customer });
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === DELETE;

  useEffect(() => {
    if (customer) {
      const actions = [
        {
          id: 1,
          icon: isItemInactive(customer.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          onClick: isItemInactive(customer.state) ? handleActivateClick : handleInactiveClick,
          text: isItemInactive(customer.state) ? "Activar" : "Desactivar",
          loading: (activeAction === ACTIVE || activeAction === INACTIVE),
          disabled: !!activeAction || isEditPending,
          width: "fit-content",
        },
        {
          id: 2,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: handleDeleteClick,
          text: "Eliminar",
          tooltip: hasAssociatedBudgets ? "No se puede eliminar este cliente, existen presupuestos asociados." : false,
          basic: true,
          loading: activeAction === DELETE,
          disabled: hasAssociatedBudgets || !!activeAction || isEditPending,
        },
      ];

      setActions(actions);
    }
  }, [customer, activeAction, isActivePending, isInactivePending, isDeletePending, isEditPending, handleActivateClick, handleInactiveClick, handleDeleteClick, setActions, hasAssociatedBudgets]);

  if (!isLoading && !customer) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || isLoadingBudgets}>
      {!isItemInactive(customer?.state) && toggleButton}
      {isItemInactive(customer?.state) && (
        <Message negative>
          <MessageHeader>Motivo de inactivación</MessageHeader>
          <p>{customer.inactiveReason}</p>
        </Message>
      )}
      <CustomerForm
        ref={formRef}
        customer={customer}
        onSubmit={mutateEdit}
        isLoading={isEditPending}
        isUpdating={isUpdating && !isItemInactive(customer?.state)}
        view
        isDeletePending={isDeletePending}
      />
      <UnsavedChangesModal
        open={showUnsavedModal}
        onDiscard={handleDiscard}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
      <ModalAction
        title={header}
        titleIcon={icon}
        titleIconColor={icon}
        onConfirm={handleActionConfirm}
        confirmationWord={requiresConfirmation ? confirmText : ""}
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

export default Customer;
