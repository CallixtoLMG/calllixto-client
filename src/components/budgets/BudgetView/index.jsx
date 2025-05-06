import { useUpdatePayments } from "@/api/budgets";
import { SubmitAndRestore } from "@/common/components/buttons";
import { Flex } from "@/common/components/custom";
import Payments from "@/common/components/form/Payments";
import { UnsavedChangesModal } from "@/common/components/modals";
import { now } from "@/common/utils/dates";
import BudgetDetails from "@/components/budgets/BudgetView/Modules/BudgetDetails";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useUnsavedChanges } from "@/hooks/unsavedChanges";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Form, Tab } from "semantic-ui-react";
import { isBudgetCancelled, isBudgetExpired, isBudgetPending } from "../budgets.utils";

const BudgetView = ({
  budget,
  subtotal,
  subtotalAfterDiscount,
  total,
  selectedContact,
  setSelectedContact,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const updatePayment = useUpdatePayments();

  const methods = useForm({
    defaultValues: {
      paymentsMade: budget?.paymentsMade || [],
    },
    mode: "onChange",
  });

  const formRef = useRef(null);
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
      methods.reset({ paymentsMade: budget?.paymentsMade });
    },
    onSave: () => {
      methods.handleSubmit(() => mutateUpdatePayment())();
    },
  });

  const {
    isUpdating,
    toggleButton,
    setIsUpdating
  } = useAllowUpdate({
    canUpdate: true,
    onBeforeView,
  });

  const { mutate: mutateUpdatePayment, isPending: isLoadingUpdatePayment } = useMutation({
    mutationFn: async () => {
      const formData = methods.getValues();
      const updatedBudget = {
        ...budget,
        paymentsMade: formData.paymentsMade,
        updatedAt: now(),
      };
      const data = await updatePayment({ budget: updatedBudget, id: budget.id });
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

  useEffect(() => {
    formRef.current = {
      isDirty: () => methods.formState.isDirty,
      submitForm: () => methods.handleSubmit(() => mutateUpdatePayment())(),
      resetForm: () => methods.reset({ paymentsMade: budget?.paymentsMade }),
    };
  }, [methods, mutateUpdatePayment, budget]);

  useEffect(() => {
    const current = methods.getValues("paymentsMade");
    if (
      !methods.formState.isDirty &&
      JSON.stringify(current) !== JSON.stringify(budget?.paymentsMade)
    ) {
      methods.reset({ paymentsMade: budget?.paymentsMade });
    }
  }, [budget?.paymentsMade, methods]);

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
              {!isBudgetCancelled(budget.state) && <Flex $justifyContent="space-between">{toggleButton}</Flex>}
              <FormProvider {...methods}>
                <Form onSubmit={methods.handleSubmit(() => mutateUpdatePayment())}>
                  <Payments deleteButtonInside padding="14px 0" noBorder noBoxShadow update={isUpdating} total={total} />
                  {isUpdating && (
                    <SubmitAndRestore
                      isUpdating={isUpdating}
                      isLoading={isLoadingUpdatePayment}
                      isDirty={isDirty}
                      onReset={() =>
                        methods.reset({ paymentsMade: budget.paymentsMade })
                      }
                      disabled={!isDirty}
                      text="Guardar"
                      submit
                    />
                  )}
                </Form>
              </FormProvider>
              <UnsavedChangesModal
                open={showUnsavedModal}
                onDiscard={handleDiscard}
                onSave={handleSave}
                onCancel={handleCancel}
                isSaving={isSaving}
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

  const handleTabChange = async (e, { activeIndex: nextIndex }) => {
    const canChange = await onBeforeView?.();
    if (canChange) {
      setActiveIndex(nextIndex);
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
