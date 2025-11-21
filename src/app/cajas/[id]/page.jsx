"use client";
import { useUserContext } from "@/User";
import { useCloseCashBalance, useDeleteCashBalance, useEditCashBalance, useGetCashBalance } from "@/api/cashBalances";
import { IconedButton } from "@/common/components/buttons";
import { FieldsContainer, Flex, Form } from "@/common/components/custom";
import { PriceField } from "@/common/components/form";
import { DatePickerControlled } from "@/common/components/form/DatePicker";
import ModalAction from "@/common/components/modals/ModalAction";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { COLORS, DELETE, ICONS, PAGES } from "@/common/constants";
import { datePickerNow, getDateUTC } from "@/common/utils/dates";
import { BillDetails } from "@/components/cashBalances/BillsDetails";
import CashBalanceForm from "@/components/cashBalances/CashBalanceForm";
import CashBalanceMovements from "@/components/cashBalances/CashBalanceMovements";
import { CASH_BALANCE_STATES, CLOSED } from "@/components/cashBalances/cashBalances.constants";
import { getBillsTotal } from "@/components/cashBalances/cashBalances.utils";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useAllowUpdate, useProtectedAction, useUnsavedChanges, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Tab } from "semantic-ui-react";

const CashBalance = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: cashBalance, isLoading, refetch } = useGetCashBalance(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions, setInfo } = useNavActionsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const editCashBalance = useEditCashBalance();
  const closeCashBalance = useCloseCashBalance();
  const deleteCashBalance = useDeleteCashBalance();
  const formRef = useRef(null);
  const form = useForm({ defaultValues: { billsDetailsOnClose: [], closeDate: datePickerNow() } });
  const billsDetails = form.watch("billsDetailsOnClose");
  const showBillsTable = useMemo(() => cashBalance?.paymentMethods?.some(method => method === "Efectivo"), [cashBalance]);

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
      { name: PAGES.CASH_BALANCES.NAME },
      {
        name: cashBalance?.id,
        label: {
          title: CASH_BALANCE_STATES[cashBalance?.state]?.singularTitle,
          color: CASH_BALANCE_STATES[cashBalance?.state]?.color
        }
      }
    ]);
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
    mutationFn: (data) => closeCashBalance(params.id, data),
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

  const handleActionConfirm = async (data) => {
    setActiveAction(modalAction);

    if (modalAction === DELETE) {
      mutateDelete();
    }

    if (modalAction === CLOSED) {
      mutateClose({ billsDetailsOnClose: data.billsDetailsOnClose, closeDate: getDateUTC(data.closeDate) });
    }
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
    setInfo(null);
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
          <Flex $marginBottom="15px">
            {cashBalance.state !== CASH_BALANCE_STATES.CLOSED.id && toggleButton}
          </Flex>
          <CashBalanceForm
            ref={formRef}
            cashBalance={cashBalance}
            onSubmit={mutateEdit}
            isLoading={isEditPending}
            isUpdating={isUpdating}
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
        onConfirm={form.handleSubmit(handleActionConfirm)}
        confirmationWord={requiresConfirmation ? confirmText : ""}
        confirmButtonIcon={icon}
        showModal={isModalOpen}
        setShowModal={handleModalClose}
        isLoading={isClosePending || isDeletePending}
        noConfirmation={!requiresConfirmation}
        onStart={() => {
          form.reset({ billsDetailsOnClose: [], closeDate: datePickerNow() });
        }}
        bodyContent={modalAction === CLOSED && (
          <FormProvider {...form}>
            <Form>
              <FieldsContainer>
                <DatePickerControlled
                  name="closeDate"
                  label="Fecha de cierre"
                  width="fit-content"
                  showMonthDropdown
                  showYearDropdown
                  showTimeSelect
                  scrollableYearDropdown
                  defaultValue={datePickerNow()}
                  dateFormat="dd-MM-yyyy HH:mm"
                  rules={{
                    validate: (value) => {
                      if (!value) return true;
                      return value <= datePickerNow() || "La fecha de cierre no puede ser mayor a la actual.";
                    }
                  }}
                />
                <IconedButton
                  icon={ICONS.CLOCK}
                  text="Ahora"
                  color={COLORS.BLUE}
                  onClick={() => form.setValue("closeDate", datePickerNow())}
                  alignSelf="end"
                  height="38px"
                />
              </FieldsContainer>
              <FieldsContainer>
                <PriceField
                  width="180px"
                  label="Monto inicial"
                  value={cashBalance.initialAmount ?? 0}
                  disabled
                />
                <PriceField
                  width="180px"
                  label="Monto actual"
                  value={cashBalance.currentAmount ?? 0}
                  disabled
                />
              </FieldsContainer>
              {showBillsTable && (
                <>
                  <PriceField
                    width="180px"
                    label="Total billetes (cierre)"
                    value={getBillsTotal(billsDetails)}
                    disabled
                  />
                  <BillDetails name="billsDetailsOnClose" />
                </>
              )}
            </Form>
          </FormProvider>
        )}
      />
    </Loader>
  );
};

export default CashBalance;
