import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, FlexColumn, Form } from "@/common/components/custom";
import { DropdownControlled, PriceControlled, PriceField, TextAreaControlled, TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { DATE_FORMATS, ENTITIES, SHORTKEYS, SIZES } from "@/common/constants";
import { mapToDropdownOptions } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { BillDetails } from "@/components/cashBalances/BillsDetails";
import { useKeyboardShortcuts, useSettingArrayField } from "@/hooks";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { BILLS_DETAILS_TABLE_HEADERS, CASH_BALANCE_STATES, CLOSED, EMPTY_CASH_BALANCE } from "../cashBalances.constants";
import { Header } from "./styles";

const CashBalanceForm = forwardRef(({
  cashBalance,
  onSubmit,
  isUpdating,
  isLoading,
  view,

  billToAdd,
  setBillToAdd,
  billError,
  setBillError,
  billButtonRef,
  openBillPopup,
  setOpenBillPopup,
  getValues,
  setValue,
  trigger
}, ref) => {
  const getInitialValues = (cashBalance) => ({ ...EMPTY_CASH_BALANCE, ...cashBalance });
  const methods = useForm({
    defaultValues: getInitialValues(cashBalance),
    billDetails: cashBalance?.billsDetails ?? [],
  });

  const { control } = methods;

  const {
    fields: billDetailsFields,
    append: appendBillDetails,
    remove: removeBillDetails
  } = useFieldArray({
    control,
    name: "billDetails",
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
        {cashBalance.billsDetails && (
          <FieldsContainer width="50%">
            {cashBalance.state === CASH_BALANCE_STATES.OPEN.id && isUpdating ? (
              <>
                {billDetailsFields.length === 0 && cashBalance.billsDetails?.length > 0 &&
                  cashBalance.billsDetails.forEach(bill => appendBillDetails(bill))
                }
                <BillDetails
                  billDetailsFields={billDetailsFields}
                  appendBillDetails={appendBillDetails}
                  removeBillDetails={removeBillDetails}
                  billToAdd={billToAdd}
                  setBillToAdd={setBillToAdd}
                  billError={billError}
                  setBillError={setBillError}
                  billButtonRef={billButtonRef}
                  openBillPopup={openBillPopup}
                  setOpenBillPopup={setOpenBillPopup}
                  getValues={getValues}
                  setValue={setValue}
                  trigger={trigger}
                />
              </>
            ) : (
              <FlexColumn $rowGap="10px">
                <Header
                  margin="0"
                  content={`Desglose de Billetes ${cashBalance.billsDetailsOnClose ? "(Inicio)" : ""}`}
                />
                <Table
                  headers={BILLS_DETAILS_TABLE_HEADERS}
                  elements={cashBalance.billsDetails}
                  mainKey="billsDetails"
                  disabled
                />
              </FlexColumn>
            )}
          </FieldsContainer>
        )}
        {cashBalance.billsDetailsOnClose &&
          <FieldsContainer width="50%">
            <Header size={SIZES.TINY} content="Detalle billetes(Cierre)"></Header>
            <Table
              headers={BILLS_DETAILS_TABLE_HEADERS}
              elements={cashBalance.billsDetailsOnClose}
              mainKey="billsDetails"
              disabled={!isUpdating || cashBalance.state === CLOSED}
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
        <TextAreaControlled name="comments" label="Comentarios" placeholder="Solo billetes de 500" disabled={!isUpdating} />
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