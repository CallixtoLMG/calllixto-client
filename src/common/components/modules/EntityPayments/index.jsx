import { SubmitAndRestore } from "@/common/components/buttons";
import { Flex } from "@/common/components/custom";
import Payments from "@/common/components/form/Payments";
import { UnsavedChangesModal } from "@/common/components/modals";
import { SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { useKeyboardShortcuts } from "@/hooks";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";

const EntityPayments = ({
  total,
  entityState,
  isCancelled = () => false,
  isUpdating,
  toggleButton,
  methods,
  onSubmit,
  isLoading,
  isDirty,
  resetValue,
  showUnsavedModal,
  handleDiscard,
  handleSave,
  handleCancel,
  isSaving,
  submitText = "Guardar",
  dueDate
}) => {
  const validateShortcuts = {
    canConfirm: () => !isLoading && isDirty,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: () => methods.handleSubmit(onSubmit)(),
      condition: validateShortcuts.canConfirm,
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => methods.reset(resetValue),
      condition: validateShortcuts.canReset,
    },
  ]);

  return (
    <>
      {!isCancelled(entityState) && (
        <Flex $justifyContent="space-between">{toggleButton}</Flex>
      )}
      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(onSubmit)} onKeyDown={preventSend}>
          <Payments
            deleteButtonInside
            padding="14px 0"
            noBorder
            noBoxShadow
            update={isUpdating}
            total={total}
            dueDate={dueDate}
          />
          {isUpdating && (
            <SubmitAndRestore
              isUpdating={isUpdating}
              isLoading={isLoading}
              isDirty={isDirty}
              onReset={() => methods.reset(resetValue)}
              disabled={!isDirty}
              text={submitText}
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

export default EntityPayments;
