import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form } from "@/common/components/custom";
import { DropdownControlled, PriceControlled, PriceField, TextAreaControlled, TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { DATE_FORMATS, ENTITIES, SHORTKEYS, SIZES } from "@/common/constants";
import { mapToDropdownOptions } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { useKeyboardShortcuts, useSettingArrayField } from "@/hooks";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Header } from "semantic-ui-react";
import { BILLS_DETAILS_TABLE_HEADERS, EMPTY_CASH_BALANCE } from "../cashBalances.constants";

const CashBalanceForm = forwardRef(({
  cashBalance, onSubmit, isUpdating, isLoading, view,
}, ref) => {
  const getInitialValues = (cashBalance) => ({ ...EMPTY_CASH_BALANCE, ...cashBalance });
  const methods = useForm({
    defaultValues: getInitialValues(cashBalance)
  });

  const paymentMethodOptions = useMemo(() => {
    return mapToDropdownOptions(cashBalance?.paymentMethods || []);
  }, [cashBalance]);

  const { options: tagsOptions, optionsMapper } = useSettingArrayField(ENTITIES.GENERAL, "paymentMethods", paymentMethodOptions || []);
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
          <TextField
            width="20%"
            label="Id"
            value={cashBalance?.id}
            disabled
          />
          <TextField
            width="200px"
            label="Fecha de inicio"
            disabled
            value={getFormatedDate(cashBalance?.startDate, DATE_FORMATS.DATE_WITH_TIME)}
          />
          {cashBalance?.closeDate &&
            <TextField
              width="200px"
              label="Fecha de cierre"
              disabled
              value={getFormatedDate(cashBalance?.closeDate, DATE_FORMATS.DATE_WITH_TIME)}
            />
          }
        </FieldsContainer>
        <FieldsContainer width="50%">
          <DropdownControlled
            name="paymentMethods"
            label="Métodos de pago"
            disabled
            multiple
            icon={(!isUpdating && view) ? null : undefined}
            optionsMapper={optionsMapper}
            options={Object.values(tagsOptions)}
            renderLabel={(item) => ({
              color: item.value.color ?? "grey",
              content: item.value.name
            })}
          />
        </FieldsContainer>
        {!!cashBalance.billsDetails?.length &&
          <FieldsContainer width="50%">
            <Header size={SIZES.TINY} content="Detalle billetes"></Header>
            <Table
              headers={BILLS_DETAILS_TABLE_HEADERS}
              elements={cashBalance.billsDetails}
              mainKey="billsDetails"
            />
          </FieldsContainer>}
        <FieldsContainer>
          <PriceControlled
            width="20%"
            name="initialAmount"
            label="Monto inicial"
            disabled={!isUpdating}
          />
          <PriceField
            width="20%"
            name="currentAmount"
            label="Monto actual"
            value={cashBalance.currentAmount ?? 0}
            disabled
          />
        </FieldsContainer>
        <TextAreaControlled name="comments" label="Comentarios" disabled={!isUpdating} />
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => reset(getInitialValues(cashBalance))}
            submit
          />
        )}
      </Form>
    </FormProvider >
  )
});

CashBalanceForm.displayName = "CashBalanceForm";

export default CashBalanceForm;
