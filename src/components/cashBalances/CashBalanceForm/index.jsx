import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField, Input } from "@/common/components/custom";
import { PriceField, TextAreaControlled, TextControlled } from "@/common/components/form";
import { DATE_FORMATS, SHORTKEYS } from "@/common/constants";
import { getFormatedDate } from "@/common/utils/dates";
import { useKeyboardShortcuts } from "@/hooks";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_CASH_BALANCE } from "../cashBalances.constants";

const CashBalanceForm = forwardRef(({
  cashBalance, onSubmit, isUpdating, isLoading, view, isDeletePending
}, ref) => {
  const getInitialValues = (cashBalance) => ({ ...EMPTY_CASH_BALANCE, ...cashBalance });
  const methods = useForm({
    defaultValues: getInitialValues(cashBalance)
  });
  const { handleSubmit, reset, formState: { isDirty } } = methods;
  useImperativeHandle(ref, () => ({
    isDirty: () => isDirty,
    submitForm: () => handleSubmit(handleForm)(),
    resetForm: () => reset(getInitialValues(cashBalance))
  }));

  const handleForm = async (data) => {
    await onSubmit(data);
    reset(data);
  };

  const validateShortcuts = {
    canConfirm: () => !isLoading && isDirty,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: handleSubmit(handleForm),
      condition: validateShortcuts.canConfirm,
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => reset(getInitialValues(cashBalance)),
      condition: validateShortcuts.canReset,
    }
  ]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleForm)}>
        <FieldsContainer>
          <FormField
            $width="20%"
            label="ID"
            control={Input}
            value={cashBalance?.id}
          />
          <FormField
            $width="200px"
            label="Fecha de inicio"
            control={Input}
            value={getFormatedDate(cashBalance?.startDate, DATE_FORMATS.ONLY_DATE)}
          />
          <FormField
            $width="200px"
            label="Fecha de cierre"
            control={Input}
            value={getFormatedDate(cashBalance?.closeDate, DATE_FORMATS.ONLY_DATE)}
          />
        </FieldsContainer>
        <FieldsContainer width="50%">
          <TextControlled
            name="paymentMethods"
            label="Métodos de pago"
            value={cashBalance.paymentMethods}
          />
        </FieldsContainer>
        <FieldsContainer>
          <PriceField
            width="20%"
            name="initialAmount"
            label="Monto inicial"
            value={cashBalance.initialAmount}
            readOnly
          />
          <PriceField
            width="20%"
            name="actualAmount"
            label="Monto actual"
            value={cashBalance.actualAmount ?? 0}
            readOnly
          />
        </FieldsContainer>
        <TextAreaControlled name="comments" label="Comentarios" readOnly={view && !isUpdating} />
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => reset(getInitialValues(cashBalance))}
            disabled={isDeletePending}
            submit
          />
        )}
      </Form>
    </FormProvider >
  )
});

CashBalanceForm.displayName = "CashBalanceForm";

export default CashBalanceForm;
