"use client";
import { useUserContext } from "@/User";
import { useCancelExpense, useEditExpense, useGetExpense, useUpdatePayments } from "@/api/expenses";
import { Flex, Message, MessageHeader } from "@/common/components/custom";
import { UnsavedChangesModal } from "@/common/components/modals";
import ModalCancel from "@/common/components/modals/ModalCancel";
import EntityPayments from "@/common/components/modules/EntityPayments";
import { CANCELLED, COLORS, ICONS, PAGES } from "@/common/constants";
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
  const [activeAction, setActiveAction] = useState(null);
  const editExpense = useEditExpense();
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);

  const formRef = useRef(null);
  const cancelExpense = useCancelExpense();

  const mockData = {
    "id": "A0002",
    "name": "DRUGS",
    "categories": [],
    "createdAt": "2025-07-07T23:34:26.297Z",
    "createdBy": "Milton Barraza",
    "updatedAt": "2025-07-08T14:12:22.342Z",
    "updatedBy": "Milton Barraza",
    "amount": 3003,
    "total": 3003,
    "paymentsMade": [
      {
        "date": "2025-07-08T15:00:00.000Z",
        "amount": 1000,
        "comments": "Primer pago",
        "method": "Transferencia Bancaria"
      },
      {
        "date": "2025-07-09T10:30:00.000Z",
        "amount": 2003,
        "comments": "Pago final",
        "method": "Efectivo"
      }
    ],
    "comments": "",
    "expirationDate": "2025-06-30T03:00:00.000Z",
    "state": "ACTIVE",
    "tags": [],
    "previousVersions": [
      {
        "name": "Drugsss",
        "amount": 300,
        "comments": "Comentario",
        "categories": [
          {
            "name": "Levi",
            "color": "grey",
            "description": "asdasd"
          },
          {
            "name": "Prueba 2",
            "color": "olive",
            "description": "ASD"
          }
        ],
        "tags": [
          {
            "name": "cacasc",
            "color": "brown",
            "description": "ascasc"
          },
          {
            "name": "cvgcvxcv",
            "color": "yellow",
            "description": ""
          }
        ],
        "expirationDate": "2025-07-17T03:00:00.000Z"
      }
    ]
  }

  const methods = useForm({
    defaultValues: {
      paymentsMade: mockData?.paymentsMade || [],
    },
    mode: "onChange",
  });

  const { isDirty } = methods.formState;

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
  const updatePayment = useUpdatePayments();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.EXPENSES.NAME, expense?.name]);
    refetch();
  }, [setLabels, expense, refetch]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
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
        setIsModalOpen(false);
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
      const formData = methods.getValues();
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
        const formData = methods.getValues();
        methods.reset(formData);
        setIsUpdating(false);
        resolveSave();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      closeModal();
    },
  });

  const handleModalCancelClose = () => {
    setIsModalCancelOpen(false);
  };

  useEffect(() => {
    const handleClick = (action) => () => handleProtectedAction(() => {
      setModalAction(action);
      setIsModalOpen(true);
    });

    if (expense) {
      const actions = RULES.canRemove[role] ? [
        {
          id: 1,
          icon: ICONS.COPY,
          color: COLORS.GREEN,
          onClick: () => { push(PAGES.EXPENSES.CLONE(expense.id)) },
          text: 'Clonar'
        },
        {
          id: 2,
          icon: ICONS.BAN,
          color: COLORS.RED,
          basic: true,
          onClick: () => handleClick(setIsModalCancelOpen(true)),
          text: "Anular",
          loading: (activeAction === CANCELLED),
          disabled: !!activeAction,
          width: "fit-content",
        },
      ] : [];

      setActions(actions);
    }
  }, [role, expense, activeAction, isCancelPending, setActions]);

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
            expense={mockData}
            onSubmit={mutateEdit}
            isLoading={isEditPending}
            isUpdating={isUpdating && !isItemCancelled(expense?.state)}
            view
          // isCancelPending={isCancelPending}
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Pagos",
      render: () => (
        <Tab.Pane>
          <EntityPayments
            total={mockData.total}
            entityState={expense.state}
            methods={methods}
            formRef={formRef}
            isCancelled={isItemCancelled}
            isUpdating={isUpdating}
            toggleButton={toggleButton}
            onSubmit={mutateUpdatePayment}
            isLoading={isLoadingUpdatePayment}
            isDirty={isDirty}
            resetValue={{ paymentsMade: mockData.paymentsMade }}
            showUnsavedModal={showUnsavedModal}
            handleDiscard={handleDiscard}
            handleSave={handleSave}
            handleCancel={handleCancel}
            isSaving={isSaving}
            dueDate={expense.expirationDate}
          />
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