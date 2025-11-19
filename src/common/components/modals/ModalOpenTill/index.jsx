import { ButtonsContainer, FieldsContainer, Flex, Form } from "@/common/components/custom";
import { DatePickerControlled } from "@/common/components/form/DatePicker/DatePickerControlled";
import { COLORS, ENTITIES, ICONS, RULES, SIZES } from "@/common/constants";
import { datePickerNow, now } from "@/common/utils/dates";
import { BillDetails } from "@/components/cashBalances/BillsDetails";
import { EMPTY_BILL } from "@/components/cashBalances/cashBalances.constants";
import { useSettingArrayField } from "@/hooks";
import { useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Modal, Transition } from "semantic-ui-react";
import { IconedButton } from "../../buttons";
import { DropdownControlled, IconedButtonControlled, PriceControlled, TextAreaControlled } from "../../form";
import { Header } from "./styles";

const ModalOpenTill = ({ open, onClose, onSubmit, paymentOptions, isLoading }) => {
  const methods = useForm({
    defaultValues: {
      startDate: datePickerNow(),
      closeDate: null,
      paymentMethods: [],
      initialAmount: 0,
      billsDetails: [],
      tempQuantity: '',
      setAllPaymentMethods: false,
    }
  });
  const { control, handleSubmit, watch, setValue, getValues, trigger, clearErrors, reset } = methods;
  const { fields: billDetailsFields, append: appendBillDetails, remove: removeBillDetails } = useFieldArray({
    control,
    name: "billsDetails"
  });
  const [billToAdd, setBillToAdd] = useState(EMPTY_BILL);
  const [openBillPopup, setOpenBillPopup] = useState(false);
  const [billError, setBillError] = useState();
  const billButtonRef = useRef(null);
  const selectedMethods = watch("paymentMethods") || [];
  const watchAllMethods = methods.watch("allPaymentMethods");
  const showBillsTable = watchAllMethods || selectedMethods.some(m => m?.name === "Efectivo");
  const billsTotal = billDetailsFields.reduce(
    (sum, b) => sum + (Number(b.denomination) * Number(b.quantity)),
    0
  );

  const { options: tagsOptions, optionsMapper } = useSettingArrayField(
    ENTITIES.GENERAL,
    "paymentMethods",
    paymentOptions ?? []
  );

  const handleCloseModal = () => {
    reset();
    removeBillDetails([...Array(billDetailsFields.length).keys()]);
    onClose();
  };

  const resetStartDate = () => {
    reset({ startDate: datePickerNow() });
  };

  const handleClosePopup = () => {
    setBillToAdd(EMPTY_BILL);
    setOpenBillPopup(false);
    setBillError(undefined);
    setValue("tempQuantity", "");
    billButtonRef.current?.focus();
    clearErrors("tempQuantity");
  };

  return (
    <FormProvider {...methods}>
      <Transition visible={open} onStart={resetStartDate} animation="scale" duration={500}>
        <Modal open={open} onClose={handleCloseModal} size={SIZES.SMALL}>
          <Header icon="inbox" content="Abrir caja" />
          <Modal.Content>
            <Form>
              <Flex $columnGap="15px">
                <FieldsContainer>
                  <DatePickerControlled
                    rules={RULES.REQUIRED}
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
                        return value <= now() || "La fecha de cierre no puede ser mayor a la actual.";
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
                    options={tagsOptions}
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
                />
              </FieldsContainer>
              <FieldsContainer>
                <PriceControlled
                  width="200px"
                  label="Monto inicial"
                  name="initialAmount"
                  rules={RULES.REQUIRED_POSITIVE_NUMBER}
                  required
                  value={0}
                />
              </FieldsContainer>
              {showBillsTable && (
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
                  updateInitialAmountButton
                />
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
                onClick={handleCloseModal}
              />
              <IconedButton
                text="Confirmar"
                icon={ICONS.CHECK}
                color={COLORS.GREEN}
                loading={isLoading}
                disabled={isLoading}
                onClick={handleSubmit((data) => {
                  const { tempQuantity, ...cleanData } = data;
                  onSubmit(cleanData);
                })}
              />
            </ButtonsContainer>
          </Modal.Actions>
        </Modal>
      </Transition>
    </FormProvider>
  );
};

export default ModalOpenTill