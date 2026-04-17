import { ButtonsContainer, FieldsContainer, Form, FormField, Input } from "@/common/components/custom";
import { DatePickerControlled } from "@/common/components/form/DatePicker/DatePickerControlled";
import { COLORS, ENTITIES, ICONS, SIZES } from "@/common/constants";
import { datePickerNow, getPastDate } from "@/common/utils/dates";
import { BillDetails } from "@/components/cashBalances/BillsDetails";
import { getBillsTotal } from "@/components/cashBalances/cashBalances.utils";
import { useSettingArrayField } from "@/hooks";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Modal, Transition } from "semantic-ui-react";
import { IconedButton } from "../../buttons";
import { DropdownControlled, PriceControlled, PriceField, TextAreaControlled } from "../../form";
import { Header, ModalContent } from "./styles";

const EMPTPY_CASH_BALANCE = {
  closeDate: null,
  paymentMethods: [],
  initialAmount: 0,
  billsDetails: [],
  setAllPaymentMethods: false,
};

const ModalOpenCashBalance = ({ open, onClose, onSubmit, paymentOptions, isLoading }) => {
  const methods = useForm({ defaultValues: { ...EMPTPY_CASH_BALANCE, startDate: datePickerNow() } });
  const { handleSubmit, watch, setValue, reset, clearErrors, trigger } = methods;
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
        <Modal size={SIZES.LARGE} open={open} onClose={onClose}>
          <Header icon="inbox" content="Abrir caja" />
          <ModalContent            >
            <Form>
              <FieldsContainer $columnGap="15px">
                <FormField $flexDirection="row" flex="1">
                  <DatePickerControlled
                    flex="1"
                    rules={{
                      required: "Campo obligatorio.",
                      validate: {
                        minDate: (value) =>
                          value >= getPastDate(1, "months") || "No puede seleccionar una fecha anterior a un mes.",
                      },
                    }}
                    name="startDate"
                    label="Fecha de inicio"
                    showMonthDropdown
                    showYearDropdown
                    showTimeSelect
                    scrollableYearDropdown
                    dateFormat="dd-MM-yyyy HH:mm"
                    required
                  />
                  <IconedButton
                    icon={ICONS.CLOCK}
                    text="Establecer fecha actual"
                    color={COLORS.BLUE}
                    onClick={() => setValue("startDate", datePickerNow())}
                    alignSelf="end"
                    height="38px"
                    iconOnly
                  />
                </FormField>
                <FormField $flexDirection="row" flex="1">
                  <DatePickerControlled
                    flex="1"
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
                    text="Establecer fecha actual"
                    color={COLORS.BLUE}
                    onClick={() => setValue("closeDate", datePickerNow())}
                    alignSelf="end"
                    height="38px"
                    iconOnly
                  />
                </FormField>
              </FieldsContainer>
              <FieldsContainer $rowGap="10px">
                <FormField $flexDirection="row" flex="1">
                  <FormField  $flexDirection="row" flex="20">
                    {watchAllMethods ? (
                      <FormField
                        label="Método de pago"
                        control={Input}
                        value="Todos"
                        readOnly
                        disabled
                      />
                    ) : (
                      <DropdownControlled
                        rules={{
                          validate: (value) => {
                            if (watchAllMethods) return true;
                            return (value && value.length > 0) || "Campo requerido";
                          }
                        }}
                        name="paymentMethods"
                        label="Método de pago"
                        placeholder="Seleccionar métodos"
                        multiple
                        selection
                        disabled={watchAllMethods}
                        options={paymentsOptions}
                        value={watch("paymentMethods")}
                        optionsMapper={optionsMapper}
                        onChange={(e, { value }) => setValue("paymentMethods", value)}
                        renderLabel={(item) => ({
                          color: item.value.color ?? "grey",
                          content: item.value.name
                        })}
                        required={!watchAllMethods}
                      />
                    )}
                  </FormField>
                  <FormField $flexDirection="row" flex="1">
                    <IconedButton
                      text={watchAllMethods ? "Deseleccionar todos los métodos de pago" : "Seleccionar todos los métodos de pago"}
                      icon={watchAllMethods ? ICONS.MINUS : ICONS.ADD}
                      color={watchAllMethods ? COLORS.ORANGE : COLORS.BLUE}
                      height="38px"
                      alignSelf="end"
                      iconOnly
                      onClick={() => {
                        const nextValue = !watchAllMethods;

                        setValue("allPaymentMethods", nextValue, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });

                        if (nextValue) {
                          setValue("paymentMethods", [], {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: false,
                          });
                          clearErrors("paymentMethods");
                        } else {
                          trigger("paymentMethods");
                        }
                      }}
                    />
                  </FormField>
                </FormField>
                <FormField flex="1" />
              </FieldsContainer>
              <FieldsContainer $alignItems="flex-end">
                <FormField flex="1">
                  <PriceControlled
                    width="100%"
                    label="Monto inicial"
                    name="initialAmount"
                    required
                  />
                </FormField>
                {showBillsTable ? (
                  <>
                    <FormField flex="1">
                      <PriceField
                        width="100%"
                        label="Total billetes"
                        value={billsTotal}
                        disabled
                      />
                    </FormField>
                    <IconedButton
                      height="38px"
                      text="Actualizar monto inicial al total de billetes"
                      icon={ICONS.DOLLAR}
                      color={COLORS.BLUE}
                      onClick={() => setValue("initialAmount", billsTotal)}
                      disabled={billsTotal === initialAmount}
                      iconOnly
                    />
                  </>
                ) : <FormField flex="1" />}
              </FieldsContainer>
              {showBillsTable && (
                <BillDetails name="billsDetails" />
              )}
              <FieldsContainer>
                <TextAreaControlled name="comments" label="Comentarios" placeholder="Solo billetes de 500" />
              </FieldsContainer>
            </Form>
          </ModalContent>
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
                width="fit-content"
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