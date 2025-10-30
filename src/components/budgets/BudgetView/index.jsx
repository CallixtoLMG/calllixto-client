import { useCreatePayment, useDeletePayment, useEditPayment } from "@/api/payments";
import EntityPayments from "@/common/components/modules/EntityPayments";
import { ENTITIES } from "@/common/constants";
import BudgetDetails from "@/components/budgets/BudgetView/Modules/BudgetDetails";
import { useAllowUpdate, useUnsavedChanges } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Tab } from "semantic-ui-react";
import { isBudgetCancelled, isBudgetExpired, isBudgetPending } from "../budgets.utils";

const BudgetView = ({
  budget,
  subtotal,
  subtotalAfterDiscount,
  total,
  selectedContact,
  setSelectedContact,
  payment,
  refetchPayment
}) => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTabIndex = tabParam === "pagos" ? 1 : 0;
  const [activeIndex, setActiveIndex] = useState(initialTabIndex);
  const router = useRouter();
  const editPayment = useEditPayment();
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const methods = useForm({
    defaultValues: {
      paymentsMade: Object.values(payment || {}).map((payment) => ({
        ...payment,
        paymentId: payment.id,
      })),
    },
    mode: "onChange",
  });
  const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formRef = useRef(null);

  const {
    onBeforeView,
  } = useUnsavedChanges({
    formRef,
  });

  const { } = useAllowUpdate({
    canUpdate: true,
    onBeforeView,
  });

  const { mutate: mutateCreatePayment, isPending: isCreatePending } = useMutation({
    mutationFn: (paymentData) =>
      createPayment(paymentData.payment, paymentData.entity, paymentData.entityId, { skipStorageUpdate: true })
    ,
    onSuccess: (response) => {
      if (response?.statusOk) {
        toast.success("Pago creado correctamente!");
        refetchPayment();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setIsModalPaymentOpen(false);
    }
  });

  const { mutate: mutateEditPayment, isPending: isEditPending } = useMutation({
    mutationFn: ({ payment, entity, entityId },) =>
      editPayment(payment, entity, entityId, {
        skipStorageUpdate: true,
      }),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Pago actualizado!");
        refetchPayment();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setIsModalPaymentOpen(false);
    }
  });

  const { mutate: mutateDeletePayment, isPending: isDeletePending } = useMutation({
    mutationFn: ({ paymentId, entity, entityId }) =>
      deletePayment({ paymentId, entity, entityId }, { skipStorageUpdate: true }),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Pago eliminado!");
        refetchPayment();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setShowDeleteModal(false)
    }
  });

  const modules = [
    {
      key: "main",
      label: "Presupuesto",
      component: (
        <BudgetDetails
          budget={budget}
          subtotal={subtotal}
          subtotalAfterDiscount={subtotalAfterDiscount}
          total={total}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
        />
      ),
    },
    ...(!isBudgetPending(budget?.state) && !isBudgetExpired(budget?.state)
      ? [
        {
          key: "payments",
          label: "Pagos",
          component: (
            <>
              <EntityPayments
                refetchPayment={refetchPayment}
                payment={payment}
                isModalPaymentOpen={isModalPaymentOpen}
                setIsModalPaymentOpen={setIsModalPaymentOpen}
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                total={total}
                entityState={budget.state}
                isCancelled={isBudgetCancelled}
                methods={methods}
                isLoading={isCreatePending || isDeletePending || isEditPending}
                onAdd={(payment) => mutateCreatePayment({ payment, entity: ENTITIES.BUDGET, entityId: budget.id })}
                onEdit={(payment) => mutateEditPayment({ payment, entity: ENTITIES.BUDGET, entityId: budget.id })}
                onDelete={(payment) => {
                  mutateDeletePayment({
                    paymentId: payment.paymentId || payment.id,
                    entity: ENTITIES.BUDGET,
                    entityId: budget.id
                  });
                }}
              />
            </>
          ),
        },
      ]
      : []),
  ];

  const panes = modules.map((mod) => ({
    menuItem: mod.label,
    render: () => <Tab.Pane>{mod.component}</Tab.Pane>,
  }));

  const handleTabChange = async (_, { activeIndex }) => {
    const canChange = await onBeforeView?.();
    if (canChange) {
      setActiveIndex(activeIndex);
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  };

  return (
    <Tab
      panes={panes}
      activeIndex={activeIndex}
      onTabChange={handleTabChange}
    />
  );
};

export default BudgetView;
