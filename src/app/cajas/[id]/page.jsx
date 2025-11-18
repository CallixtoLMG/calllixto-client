"use client";
import { useUserContext } from "@/User";
import { useCloseCashBalance, useDeleteCashBalance, useEditCashBalance, useGetCashBalance } from "@/api/cashBalances";
import { Flex } from "@/common/components/custom";
import ModalAction from "@/common/components/modals/ModalAction";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { COLORS, DELETE, ICONS, PAGES } from "@/common/constants";
import { isItemInactive } from "@/common/utils";
import CashBalanceForm from "@/components/cashBalances/CashBalanceForm";
import CashBalanceMovements from "@/components/cashBalances/CashBalanceMovements";
import { CASH_BALANCE_STATES, CLOSED } from "@/components/cashBalances/cashBalances.constants";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useAllowUpdate, useProtectedAction, useUnsavedChanges, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Tab } from "semantic-ui-react";

const CashBalance = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: cashBalance, isLoading, refetch } = useGetCashBalance(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const editCashBalance = useEditCashBalance();
  const closeCashBalance = useCloseCashBalance();
  const deleteCashBalance = useDeleteCashBalance();
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
    setLabels([
      PAGES.CASH_BALANCES.NAME,
      cashBalance?.id
        ? { id: cashBalance.id, title: CASH_BALANCE_STATES[cashBalance.state]?.singularTitle, color: CASH_BALANCE_STATES[cashBalance.state]?.color }
        : null
    ].filter(Boolean));
    refetch();
  }, [setLabels, cashBalance, refetch]);

  const modalConfig = useMemo(() => ({
    delete: {
      header: `¿Está seguro que desea eliminar la caja "${cashBalance?.id}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    closed: {
      header: `¿Está seguro que desea cerrar  la caja "${cashBalance?.id}"?`,
      icon: ICONS.CLOSE
    },

  }), [cashBalance]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: editCashBalance,
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Caja actualizada!");
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

  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: () => deleteCashBalance(params.id),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Caja eliminada permanentemente!");
        push(PAGES.CASH_BALANCES.BASE);
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateClose, isPending: isClosePending } = useMutation({
    mutationFn: ({ cashBalance }) => closeCashBalance(cashBalance),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Caja cerrada!");
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

    if (modalAction === DELETE) {
      mutateDelete();
    }

    if (modalAction === CLOSED) {
      mutateClose({ cashBalance });
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === DELETE;

  useEffect(() => {
    if (!cashBalance) return;

    const handleClick = (action) => () => handleProtectedAction(() => {
      setModalAction(action);
      setIsModalOpen(true);
    });

    let actions = [];

    if (RULES.canRemove[role]) {
      if (cashBalance.state !== CASH_BALANCE_STATES.CLOSED.id) {
        actions.push({
          id: 1,
          icon: ICONS.CLOSE,
          color: COLORS.ORANGE,
          text: "Cerrar caja",
          width: "fit-content",
          basic: true,
          onClick: handleClick(CLOSED),
        });
      }

      actions.push({
        id: 2,
        icon: ICONS.TRASH,
        color: COLORS.RED,
        text: "Eliminar",
        basic: true,
        onClick: handleClick(DELETE),
        loading: activeAction === DELETE,
        disabled: !!activeAction,
      });
    }

    setActions(actions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, activeAction, setActions, cashBalance]);


  if (!isLoading && !cashBalance) {
    push(PAGES.NOT_FOUND.BASE);
  }

  const panes = [
    {
      menuItem: "Caja",
      render: () => (
        <Tab.Pane>
          <Flex $justifyContent="space-between" $marginBottom="15px">
            {toggleButton}
          </Flex>
          <CashBalanceForm
            ref={formRef}
            cashBalance={cashBalance}
            onSubmit={mutateEdit}
            isLoading={isEditPending}
            isUpdating={isUpdating && !isItemInactive(cashBalance?.state)}
            view
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Movimientos",
      render: () => (
        <Tab.Pane>
          <CashBalanceMovements cashBalance={cashBalance} />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <Loader active={isLoading || !cashBalance}>
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
        isLoading={isClosePending || isDeletePending}
        noConfirmation={!requiresConfirmation}
      />
    </Loader>
  );
};

export default CashBalance;
