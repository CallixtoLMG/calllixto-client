"use client";
import { useUserContext } from "@/User";
import { useEditCashBalance, useGetCashBalance } from "@/api/cashBalances";
import { TextField } from "@/common/components/form";
import ModalAction from "@/common/components/modals/ModalAction";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { COLORS, DELETE, ICONS, INACTIVE, PAGES } from "@/common/constants";
import { isItemInactive } from "@/common/utils";
import CashBalanceForm from "@/components/cashBalances/CashBalanceForm";
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
  const [reason, setReason] = useState("");
  const editCashBalance = useEditCashBalance();
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

  // const deleteBrand = useDeleteBrand();
  // const activeBrand = useActiveBrand();
  // const inactiveBrand = useInactiveBrand();
  const { handleProtectedAction } = useProtectedAction({ formRef, onBeforeView });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.CASH_BALANCES.NAME, cashBalance?.name]);
    refetch();
  }, [setLabels, cashBalance, refetch]);

  const modalConfig = useMemo(() => ({
    delete: {
      header: `¿Está seguro que desea eliminar la marca "${cashBalance?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },

  }), [cashBalance]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setReason("");
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

  // const { mutate: mutateActive, isPending: isActivePending } = useMutation({
  //   mutationFn: ({ brand }) => activeBrand(brand),
  //   onSuccess: (response) => {
  //     if (response.statusOk) {
  //       toast.success("Marca activada!");
  //     } else {
  //       toast.error(response.error.message);
  //     }
  //   },
  //   onSettled: () => {
  //     setActiveAction(null);
  //     handleModalClose();
  //   },
  // });

  // const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
  //   mutationFn: () => deleteBrand(params.id),
  //   onSuccess: (response) => {
  //     if (response.statusOk) {
  //       toast.success("Marca eliminada permanentemente!");
  //       push(PAGES.BRANDS.BASE);
  //     } else {
  //       toast.error(response.error.message);
  //     }
  //   },
  //   onSettled: () => {
  //     setActiveAction(null);
  //     handleModalClose();
  //   },
  // });

  const handleActionConfirm = async () => {
    setActiveAction(modalAction);

    if (modalAction === DELETE) {
      mutateDelete();
    }

    // if (modalAction === INACTIVE) {
    //   if (!reason) {
    //     toast.error("Debe proporcionar una razón para desactivar la marca.");
    //     return;
    //   }
    //   mutateInactive({ brand, reason });
    // }

    // if (modalAction === ACTIVE) {
    //   mutateActive({ brand });
    // }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === DELETE;

  useEffect(() => {
    if (cashBalance) {
      const handleClick = (action) => () => handleProtectedAction(() => {
        setModalAction(action);
        setIsModalOpen(true);
      });

      const actions = RULES.canRemove[role] ? [
        {
          id: 1,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          text: "Eliminar",
          basic: true,
          onClick: handleClick(DELETE),
          loading: activeAction === DELETE,
          disabled: !!activeAction,
        },
      ] : [];
      setActions(actions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, activeAction, setActions]);

  if (!isLoading && !cashBalance) {
    push(PAGES.NOT_FOUND.BASE);
  }

  const panes = [
    {
      menuItem: "Caja",
      render: () => (
        <Tab.Pane>
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
          {/* <ProductChanges product={product} /> */}
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
        // isLoading={isInactivePending || isActivePending}
        noConfirmation={!requiresConfirmation}
        disableButtons={!reason && modalAction === INACTIVE}
        bodyContent={
          modalAction === INACTIVE && (
            <TextField
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

export default CashBalance;
