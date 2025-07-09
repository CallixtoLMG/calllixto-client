import { SubmitAndRestore } from "@/common/components/buttons";
import { Flex } from "@/common/components/custom";
import Payments from "@/common/components/form/Payments";
import { UnsavedChangesModal } from "@/common/components/modals";
import { SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { isBudgetCancelled } from "@/components/budgets/budgets.utils";
import { useKeyboardShortcuts } from "@/hooks";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";

const BudgetPayments = ({
  budget,
  total,
  methods,
  isUpdating,
  toggleButton,
  mutateUpdatePayment,
  isLoadingUpdatePayment,
  isDirty,
  showUnsavedModal,
  handleDiscard,
  handleSave,
  handleCancel,
  isSaving,
}) => {

  const validateShortcuts = {
    canConfirm: () => !isLoadingUpdatePayment && isDirty,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: () => methods.handleSubmit(() => mutateUpdatePayment())(),
      condition: validateShortcuts.canConfirm,
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => methods.reset({ paymentsMade: budget.paymentsMade }),
      condition: validateShortcuts.canReset,
    },
  ]);

  return (
    <>
      {!isBudgetCancelled(budget.state) && (
        <Flex $justifyContent="space-between">{toggleButton}</Flex>
      )}
      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(() => mutateUpdatePayment())} onKeyDown={preventSend}>
          <Payments
            deleteButtonInside
            padding="14px 0"
            noBorder
            noBoxShadow
            update={isUpdating}
            total={total}
          />
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
  );
};

export default BudgetPayments;
