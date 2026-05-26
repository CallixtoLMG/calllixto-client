import { IconedButton, SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, FlexColumn, Form, FormField } from "@/common/components/custom";
import { DropdownControlled, PriceControlled, PriceField, TextAreaControlled, TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { CONTENT_SIZES, COLORS, DATE_FORMATS, ENTITIES, ICONS, SHORTKEYS } from "@/common/constants";
import { mapToDropdownOptions } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { BillDetails } from "@/components/cashBalances/BillsDetails";
import { useKeyboardShortcuts, useSettingArrayField } from "@/hooks";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { BILLS_DETAILS_TABLE_HEADERS, CASH_BALANCE_STATES, EMPTY_CASH_BALANCE } from "../cashBalances.constants";
import { getBillsTotal } from "../cashBalances.utils";
import { Header } from "./styles";

const getInitialValues = (cashBalance) => ({ ...EMPTY_CASH_BALANCE, ...cashBalance });

const CashBalanceForm = forwardRef(({
  cashBalance,
  onSubmit,
  isUpdating,
  isLoading,
}, ref) => {
  const methods = useForm({
    defaultValues: getInitialValues(cashBalance)
  });
  const { watch, setValue } = methods;
  const [initialAmount, billsDetails, billsDetailsOnClose] = watch(['initialAmount', 'billsDetails', 'billsDetailsOnClose']);

  const paymentMethodOptions = useMemo(() => {
    return mapToDropdownOptions(cashBalance?.paymentMethods || []);
  }, [cashBalance]);

  const { options: tagsOptions, optionsMapper } = useSettingArrayField(ENTITIES.GENERAL, "paymentMethods", paymentMethodOptions || []);

  const billsTotal = useMemo(() => getBillsTotal(billsDetails), [billsDetails]);
  const showBillsTable = useMemo(() => cashBalance?.paymentMethods?.some(method => method === "Efectivo"), [cashBalance]);

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
          <FormField flex="1">
            <TextField
              label="Id"
              value={cashBalance?.id}
              disabled
            />
          </FormField>
          <FormField flex="1">
            <TextField
              label="Fecha de inicio"
              value={getFormatedDate(cashBalance?.startDate, DATE_FORMATS.DATE_WITH_TIME)}
              disabled
            />
          </FormField>
          <FormField flex="1">
            {cashBalance?.closeDate &&
              <TextField
                label="Fecha de cierre"
                value={getFormatedDate(cashBalance?.closeDate, DATE_FORMATS.DATE_WITH_TIME)}
                disabled
              />
            }
          </FormField>
        </FieldsContainer>
        <FieldsContainer >
          {cashBalance?.allPaymentMethods ? (
            <>
              <FormField flex="1">
                <TextField
                  label="Métodos de pago"
                  value="Todos los métodos de pago"
                  disabled
                />
              </FormField>
              <FormField flex="1" />
              <FormField flex="1" />
            </>
          ) : (
            <>
              <FormField flex="1">
                <DropdownControlled
                  name="paymentMethods"
                  label="Métodos de pago"
                  multiple
                  disabled
                  optionsMapper={optionsMapper}
                  options={Object.values(tagsOptions)}
                  renderLabel={(item) => ({
                    color: item.value.color ?? "grey",
                    content: item.value.name
                  })}
                />
              </FormField>
              <FormField flex="1" />
            </>
          )}
        </FieldsContainer>
        <FieldsContainer $alignItems="flex-end">
          <FormField flex="1">
            <PriceControlled
              flex="1"
              name="initialAmount"
              label="Monto inicial"
              disabled={!isUpdating}
            />
          </FormField>
          {showBillsTable ? (
            <>
              <FormField flex="1">
                <PriceField
                  flex="1"
                  label="Total billetes"
                  value={billsTotal}
                  disabled
                />
              </FormField>
              {billsDetailsOnClose && (
                <FormField disabled flex="1">
                  <PriceField
                    label="Total billetes (cierre)"
                    value={getBillsTotal(billsDetailsOnClose)}
                    disabled
                  />
                </FormField>
              )}
              <FormField disabled={billsTotal === initialAmount} flex="1">
                {isUpdating && (
                  <IconedButton
                    text="Actualizar monto inicial"
                    icon={ICONS.DOLLAR}
                    color={COLORS.BLUE}
                    onClick={() => setValue("initialAmount", billsTotal, {
                      shouldDirty: true,
                    })}
                    height="38px"
                    width={CONTENT_SIZES.FIT}
                  />
                )}
              </FormField>
            </>
          ) :
            <>
              <FormField disabled flex="1" />
              <FormField disabled flex="1" />
            </>
          }
        </FieldsContainer>
        <FieldsContainer >
          <FormField flex="1">
            <PriceField
              name="currentAmount"
              label="Monto actual"
              value={cashBalance.currentAmount ?? 0}
              disabled
            />
          </FormField>
          <FormField disabled flex="1" />
          <FormField disabled flex="1" />
        </FieldsContainer>
        {showBillsTable && (
          <>
            {cashBalance.state === CASH_BALANCE_STATES.OPEN.id && isUpdating ? (
              <BillDetails name="billsDetails" />
            ) : (
              <>
                <FlexColumn $rowGap="10px">
                  <Header content="Desglose de billetes" />
                  <Table
                    headers={BILLS_DETAILS_TABLE_HEADERS}
                    elements={billsDetails}
                  />
                </FlexColumn>
                {billsDetailsOnClose && (
                  <FlexColumn $rowGap="10px">
                    <Header content="Detalle de billetes (cierre)" />
                    <Table
                      headers={BILLS_DETAILS_TABLE_HEADERS}
                      elements={billsDetailsOnClose}
                    />
                  </FlexColumn>
                )}
              </>
            )}
          </>
        )}
        <FormField>
          <TextAreaControlled
            name="comments"
            label="Comentarios"
            placeholder="Solo billetes de 500"
            disabled={!isUpdating}
          />
        </FormField>
        {isUpdating && (
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