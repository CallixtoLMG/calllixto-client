import { ButtonsContainer, FieldsContainer, Flex, Form } from "@/common/components/custom";
import { DatePickerControlled } from "@/common/components/form/DatePicker/DatePickerControlled";
import { COLORS, ENTITIES, ICONS, RULES } from "@/common/constants";
import { datePickerNow, getPastDate } from "@/common/utils/dates";
import { BillDetails } from "@/components/cashBalances/BillsDetails";
import { getBillsTotal } from "@/components/cashBalances/cashBalances.utils";
import { useSettingArrayField } from "@/hooks";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Modal, Transition } from "semantic-ui-react";
import { IconedButton } from "../../buttons";
import { DropdownControlled, IconedButtonControlled, PriceControlled, PriceField, TextAreaControlled } from "../../form";
import { Header } from "./styles";

const EMPTPY_CASH_BALANCE = {
  closeDate: null,
  paymentMethods: [],
  initialAmount: 0,
  billsDetails: [],
  setAllPaymentMethods: false,
};

const ModalOpenCashBalance = ({ open, onClose, onSubmit, paymentOptions, isLoading }) => {
  const methods = useForm({ defaultValues: { ...EMPTPY_CASH_BALANCE, startDate: datePickerNow() } });
  const { handleSubmit, watch, setValue, reset } = methods;
  const [selectedMethods, watchAllMethods, initialAmount, billsDetails] = watch(['paymentMethods', 'allPaymentMethods', 'initialAmount', 'billsDetails']);
  const showBillsTable = watchAllMethods || selectedMethods?.some(m => m?.name === "Efectivo");
  const billsTotal = useMemo(() => getBillsTotal(billsDetails), [billsDetails]);

  const { options: paymentsOptions, optionsMapper } = useSettingArrayField(
    ENTITIES.GENERAL,
    "paymentMethods",
    paymentOptions ?? []
  );

  const handleOnStart = () => {
    reset({ ...EMPTPY_CASH_BALANCE, startDate: datePickerNow() });
  };

  return (
    <FormProvider {...methods}>
      <Transition visible={open} onStart={handleOnStart} animation="scale" duration={500}>
        <Modal open={open} onClose={onClose}>
          <Header icon="inbox" content="Abrir caja" />
          <Modal.Content>
            <Form>
              <Flex $columnGap="15px">
                <FieldsContainer>
                  <DatePickerControlled
                    rules={{
                      required: "Campo obligatorio.",
                      validate: {
                        minDate: (value) =>
                          value >= getPastDate(1, "months") || "No puede seleccionar una fecha anterior a un mes.",
                      },
                    }}
                    name="startDate"
                    label="Fecha de inicio"
                    width="fit-content"
                    showMonthDropdown
                    showYearDropdown
                    showTimeSelect
                    scrollableYearDropdown
                    dateFormat="dd-MM-yyyy HH:mm"
                    required
                  />
                  <IconedButton
                    icon={ICONS.CLOCK}
                    text="Ahora"
                    color={COLORS.BLUE}
                    onClick={() => setValue("startDate", datePickerNow())}
                    alignSelf="end"
                    height="38px"
                  />
                  <DatePickerControlled
                    name="closeDate"
                    label="Fecha de cierre"
                    width="fit-content"
                    showMonthDropdown
                    showYearDropdown
                    showTimeSelect
                    maxDate={new Date()}
                    scrollableYearDropdown
                    dateFormat="dd-MM-yyyy HH:mm"
                    rules={{
                      validate: (value) => {
                        if (!value) return true;
                        return value <= datePickerNow() || "La fecha de cierre no puede ser mayor a la actual.";
                      }
                    }}
                  />
                  <IconedButton
                    icon={ICONS.CLOCK}
                    text="Ahora"
                    color={COLORS.BLUE}
                    onClick={() => setValue("closeDate", datePickerNow())}
                    alignSelf="end"
                    height="38px"
                  />
                </FieldsContainer>
              </Flex>
              <FieldsContainer $alignItems="end" $rowGap="10px">
                {!watchAllMethods &&
                  <DropdownControlled
                    height="fit-content"
                    rules={RULES.REQUIRED}
                    name="paymentMethods"
                    label="Método de Pago"
                    placeholder="Seleccionar métodos"
                    width="fit-content"
                    multiple
                    selection
                    options={paymentsOptions}
                    value={watch("paymentMethods")}
                    optionsMapper={optionsMapper}
                    onChange={(e, { value }) => setValue("paymentMethods", value)}
                    renderLabel={(item) => ({
                      color: item.value.color ?? "grey",
                      content: item.value.name
                    })}
                    required
                  />
                }
                <IconedButtonControlled
                  width="fit-content"
                  name="allPaymentMethods"
                  text="Todos los métodos"
                  icon={ICONS.PENCIL}
                  color={COLORS.BLUE}
                  height="38px"
                />
              </FieldsContainer>
              <FieldsContainer $alignItems="flex-end">
                <PriceControlled
                  width="200px"
                  label="Monto inicial"
                  name="initialAmount"
                  required
                />
                {showBillsTable && (
                  <>
                    <PriceField
                      width="200px"
                      label="Total billetes"
                      value={billsTotal}
                      disabled
                    />
                    <IconedButton
                      text="Actualizar Monto Inicial"
                      icon={ICONS.DOLLAR}
                      color={COLORS.BLUE}
                      onClick={() => setValue("initialAmount", billsTotal)}
                      disabled={billsTotal === initialAmount}
                    />
                  </>
                )}
              </FieldsContainer>
              {showBillsTable && (
                <BillDetails name="billsDetails" />
              )}
              <FieldsContainer>
                <TextAreaControlled name="comments" label="Comentarios" placeholder="Solo billetes de 500" />
              </FieldsContainer>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <ButtonsContainer width="100%">
              <IconedButton
                text="Cancelar"
                icon={ICONS.CANCEL}
                color={COLORS.RED}
                onClick={onClose}
              />
              <IconedButton
                text="Confirmar"
                icon={ICONS.CHECK}
                color={COLORS.GREEN}
                loading={isLoading}
                disabled={isLoading}
                onClick={handleSubmit(onSubmit)}
              />
            </ButtonsContainer>
          </Modal.Actions>
        </Modal>
      </Transition>
    </FormProvider>
  );
};

export default ModalOpenCashBalance