"use client";

import { useListBudgets } from "@/api/budgets";
import { useActiveCustomer, useDeleteCustomer, useEditCustomer, useGetCustomer, useInactiveCustomer } from "@/api/customers";
import { Input } from "@/components/common/custom";
import ModalAction from "@/components/common/modals/ModalAction";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerView from "@/components/customers/CustomerView";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { COLORS, ICONS, PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { isItemInactive } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const Customer = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { data: customer, isLoading } = useGetCustomer(params.id);
  const { data: budgetData, isLoading: isLoadingBudgets } = useListBudgets();
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { isUpdating, toggleButton } = useAllowUpdate({ canUpdate: true });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const editCustomer = useEditCustomer();
  const deleteCustomer = useDeleteCustomer();
  const inactiveCustomer = useInactiveCustomer();
  const activeCustomer = useActiveCustomer();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.CUSTOMERS.NAME, customer?.name]);
  }, [customer, setLabels]);

  const hasAssociatedBudgets = useMemo(() => {
    return budgetData?.budgets?.some(budget => budget.customer?.id === customer?.id);
  }, [budgetData, customer]);

  const modalConfig = useMemo(() => ({
    delete: {
      header: `¿Está seguro que desea eliminar el cliente ${customer?.id}?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH
    },
    active: {
      header: `¿Está seguro que desea activar el cliente ${customer?.id}?`,
      icon: ICONS.PLAY_CIRCLE
    },
    inactive: {
      header: `¿Está seguro que desea desactivar el cliente ${customer?.id}?`,
      icon: ICONS.PAUSE_CIRCLE
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

  const handleActivateClick = useCallback(() => handleOpenModalWithAction("active"), [handleOpenModalWithAction]);
  const handleInactiveClick = useCallback(() => handleOpenModalWithAction("inactive"), [handleOpenModalWithAction]);
  const handleDeleteClick = useCallback(() => handleOpenModalWithAction("delete"), [handleOpenModalWithAction]);

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: async (customer) => {
      const data = await editCustomer(customer);

      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Cliente actualizado!");
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

  const { mutate: mutateActive, isPending: isActivePending } = useMutation({
    mutationFn: async ({ customer }) => {
      const response = await activeCustomer(customer);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Cliente activado!");
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

  const { mutate: mutateInactive, isPending: isInactivePending } = useMutation({
    mutationFn: async ({ customer, reason }) => {
      const response = await inactiveCustomer(customer, reason);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Cliente desactivado!");
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

  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: () => {
      return deleteCustomer(params.id);
    },
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
    if (modalAction === "inactive") {
      if (!reason) {
        toast.error("Debe proporcionar una razón para desactivar al cliente.");
        return;
      }
    }

    setActiveAction(modalAction);

    if (modalAction === "delete") {
      mutateDelete();
    } else if (modalAction === "inactive") {
      mutateInactive({ customer, reason });
    } else if (modalAction === "active") {
      mutateActive({ customer });
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === "delete";

  useEffect(() => {
    if (customer) {
      const actions = [
        {
          id: 1,
          icon: isItemInactive(customer.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          onClick: isItemInactive(customer.state) ? handleActivateClick : handleInactiveClick,
          text: isItemInactive(customer.state) ? "Activar" : "Desactivar",
          loading: (activeAction === "active" || activeAction === "inactive"),
          disabled: !!activeAction,
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
          loading: activeAction === "delete",
          disabled: hasAssociatedBudgets || !!activeAction,
        },
      ];

      setActions(actions);
    }
  }, [customer, activeAction, isActivePending, isInactivePending, isDeletePending, handleActivateClick, handleInactiveClick, handleDeleteClick, setActions]);

  if (!isLoading && !customer) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || isLoadingBudgets}>
      {toggleButton}
      {isUpdating ? (
        <CustomerForm
          customer={customer}
          onSubmit={mutateEdit}
          isLoading={isEditPending}
          isUpdating
        />
      ) : (
        <CustomerView customer={customer} />
      )}
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

export default Customer;
