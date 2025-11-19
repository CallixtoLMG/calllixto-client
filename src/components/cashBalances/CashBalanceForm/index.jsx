import { IconedButton, SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Flex, FlexColumn, Form } from "@/common/components/custom";
import { DropdownControlled, PriceControlled, PriceField, TextAreaControlled, TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, DATE_FORMATS, ENTITIES, ICONS, SHORTKEYS, SIZES } from "@/common/constants";
import { mapToDropdownOptions } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { BillDetails } from "@/components/cashBalances/BillsDetails";
import { useKeyboardShortcuts, useSettingArrayField } from "@/hooks";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { BILLS_DETAILS_TABLE_HEADERS, CASH_BALANCE_STATES, EMPTY_CASH_BALANCE } from "../cashBalances.constants";
import { Header } from "./styles";
import { getBillsTotal } from "../cashBalances.utils";

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
        <FieldsContainer width="fit-content">
          <DropdownControlled
            name="paymentMethods"
            label="Métodos de pago"
            disabled
            multiple
            optionsMapper={optionsMapper}
            options={Object.values(tagsOptions)}
            renderLabel={(item) => ({
              color: item.value.color ?? "grey",
              content: item.value.name
            })}
          />
        </FieldsContainer>
        <FieldsContainer $alignItems="flex-end">
          <PriceControlled
            width="180px"
            name="initialAmount"
            label="Monto inicial"
            disabled={!isUpdating}
          />
          {showBillsTable && (
            <>
              <PriceField
                width="180px"
                label="Total billetes"
                value={billsTotal}
                disabled
              />
              {billsDetailsOnClose && (
                <PriceField
                  width="180px"
                  label="Total billetes (cierre)"
                  value={getBillsTotal(billsDetailsOnClose)}
                  disabled
                />
              )}
              {isUpdating && (
                <IconedButton
                  text="Actualizar Monto Inicial"
                  icon={ICONS.DOLLAR}
                  color={COLORS.BLUE}
                  onClick={() => setValue("initialAmount", billsTotal)}
                  disabled={billsTotal === initialAmount}
                />
              )}
            </>
          )}
          <PriceField
            width="180px"
            name="currentAmount"
            label="Monto actual"
            value={cashBalance.currentAmount ?? 0}
            disabled
          />
        </FieldsContainer>
        {showBillsTable && (
          <FieldsContainer width="80%">
            {cashBalance.state === CASH_BALANCE_STATES.OPEN.id && isUpdating ? (
              <BillDetails name="billsDetails" />
            ) : (
              <Flex $columnGap="30px">
                <FlexColumn $rowGap="10px">
                  <Header content="Desglose de billetes" />
                  <Table
                    headers={BILLS_DETAILS_TABLE_HEADERS}
                    elements={billsDetails}
                  />
                </FlexColumn>
                {billsDetailsOnClose && (
                  <FlexColumn $rowGap="10px">
                    <Header content="Detalle de billetes (cierre)"></Header>
                    <Table
                      headers={BILLS_DETAILS_TABLE_HEADERS}
                      elements={billsDetailsOnClose}
                    />
                  </FlexColumn>
                )}
              </Flex>
            )}
          </FieldsContainer>
        )}

        <TextAreaControlled name="comments" label="Comentarios" placeholder="Solo billetes de 500" disabled={!isUpdating} />
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