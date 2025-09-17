import { ButtonsContainer, FieldsContainer, Flex, FlexColumn, Form, FormField } from "@/common/components/custom";
import { DatePickerControlled } from "@/common/components/form/DatePicker/DatePickerControlled";
import { COLORS, ICONS, RULES } from "@/common/constants";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Modal, Transition } from "semantic-ui-react";
import { IconedButton } from "../../buttons";
import { DropdownControlled, NumberControlled, PriceControlled, TextAreaControlled } from "../../form";
import { Header } from "./styles";

const mockPaymentMethods = [
  { "key": "mercado_pago", "text": "Mercado Pago", "value": "Mercado Pago" },
  { "key": "efectivo", "text": "Efectivo", "value": "Efectivo" },
  { "key": "mercado_pagos", "text": "Mercado Pagos", "value": "Mercado Pagos" }
]

const ModalOpenTill = ({ open, onClose, onSubmit, paymentOptions, isLoading }) => {
  const methods = useForm({
    defaultValues: {
      startDate: null,
      closeDate: null,
      paymentMethods: [],
      initialAmount: 0,
      billsDetails: []
    }
  });

  const { control, handleSubmit, watch, setValue } = methods;
  const { fields: billDetailsFields, append: appendBillDetails, remove: removeBillDetails } = useFieldArray({
    control,
    name: "billsDetails"
  });

  const selectedMethods = watch("paymentMethods") || [];
  const showBillsTable = selectedMethods.includes("Efectivo");

  return (
    <FormProvider {...methods}>
      <Transition visible={open} animation="scale" duration={500}>
        <Modal open={open} onClose={onClose} size="small">
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
                  <DatePickerControlled
                    name="closeDate"
                    label="Fecha de cierre"
                    width="fit-content"
                    showMonthDropdown
                    showYearDropdown
                    showTimeSelect
                    scrollableYearDropdown
                    dateFormat="dd-MM-yyyy HH:mm"
                  />
                </FieldsContainer>
              </Flex>
              <FieldsContainer>
                <FormField>
                  <DropdownControlled
                    height="fit-content"
                    rules={RULES.REQUIRED}
                    name="paymentMethods"
                    label="Método de Pago"
                    placeholder="Seleccionar métodos"
                    width="fit-content"
                    multiple
                    selection
                    // options={paymentOptions}
                    options={mockPaymentMethods}

                    value={watch("paymentMethods")}
                    onChange={(e, { value }) => setValue("paymentMethods", value)}
                    required
                  />
                </FormField>
              </FieldsContainer>

              {showBillsTable && (
                <FieldsContainer>
                  <FlexColumn $rowGap="10px">
                    <Header margin="0">Desglose de Billetes</Header>
                    <IconedButton

                      text="Agregar billete"
                      icon={ICONS.ADD}
                      color={COLORS.GREEN}
                      onClick={() => appendBillDetails({ denomination: '', quantity: '' })}
                    />
                    {billDetailsFields.map((field, index) => (
                      <Flex key={field.id} $columnGap="10px" $alignItems="center">
                        <PriceControlled
                          name={`bills.${index}.denomination`}
                          label="Denominación"
                          width="200px"
                          rules={{
                            required: "Denominación requerida",
                            validate: v => v && Number(v) > 0 ? true : "Debe ser número y mayor a cero"
                          }}
                        />
                        <NumberControlled
                          name={`bills.${index}.quantity`}
                          label="Cantidad"
                          width="200px"
                          rules={{
                            required: "Cantidad requerida",
                            validate: v => v && Number(v) > 0 ? true : "Debe ser número y mayor a cero"
                          }}
                        />
                        <IconedButton
                          height="38px"
                          alignSelf="end"
                          icon={ICONS.TRASH}
                          color={COLORS.RED}
                          onClick={() => removeBillDetails(index)}
                        />
                      </Flex>
                    ))}

                  </FlexColumn>
                </FieldsContainer>
              )}
              <FieldsContainer>
                <FormField>
                  <PriceControlled
                    width="200px"
                    label="Monto inicial"
                    name="initialAmount"
                    rules={RULES.REQUIRED_POSITIVE_NUMBER}
                    required
                    value={0}
                  />
                </FormField>
              </FieldsContainer>
              <FieldsContainer>
                <TextAreaControlled name="comments" label="Comentarios" />
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

export default ModalOpenTill