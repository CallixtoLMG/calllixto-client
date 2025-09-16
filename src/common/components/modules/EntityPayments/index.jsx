import { SubmitAndRestore } from "@/common/components/buttons";
import { Flex } from "@/common/components/custom";
import Payments from "@/common/components/form/Payments";
import { DATE_FORMATS, SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { useKeyboardShortcuts } from "@/hooks";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { TextField } from "../../form";

const EntityPayments = forwardRef(({
  total,
  entityState,
  isCancelled = () => false,
  isUpdating,
  toggleButton,
  methods,
  onSubmit,
  isLoading,
  submitText = "Guardar",
  isDirty,
  resetValue,
  dueDate,
}, ref) => {
  const {
    handleSubmit,
    reset,
  } = methods;

  useImperativeHandle(ref, () => ({
    isDirty: () => isDirty,
    submitForm: () => handleSubmit(onSubmit)(),
    resetForm: () => reset(resetValue),
    getValues: () => methods.getValues(),
  }));

  const validateShortcuts = {
    canConfirm: () => !isLoading && isDirty,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: () => handleSubmit(onSubmit)(),
      condition: validateShortcuts.canConfirm,
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => reset(resetValue),
      condition: validateShortcuts.canReset,
    },
  ]);

  return (
    <>
      {!isCancelled(entityState) && (
        <Flex $justifyContent="space-between">
          {toggleButton}
          <TextField
            width="20%"
            value={getFormatedDate(dueDate, DATE_FORMATS.ONLY_DATE)}
            label="Fecha de Vencimiento"
            disabled
          />
        </Flex>
      )}
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmit)} onKeyDown={preventSend}>
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
              onReset={() => reset({ paymentsMade: resetValue?.paymentsMade || [] })}
              disabled={!isDirty}
              text={submitText}
              submit
            />
          )}
        </Form>
      </FormProvider>
    </>
  );
});

EntityPayments.displayName = "EntityPayments";

export default EntityPayments;
