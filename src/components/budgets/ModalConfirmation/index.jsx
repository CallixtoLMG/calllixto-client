import { ButtonsContainer, FieldsContainer, Flex, FlexColumn, FormField, IconedButton, Label, Price, RuledLabel, Segment } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { PICK_UP_IN_STORE } from "@/constants";
import { formatedSimplePhone } from "@/utils";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ButtonGroup, Dropdown, Form, Icon, Input, Modal, Transition } from "semantic-ui-react";
import { Divider, Title } from "../PDFfile/styles";

const PAYMENT_METHODS = [
  { key: 'efectivo', text: 'Efectivo', value: 'Efectivo' },
  { key: 'transferencia', text: 'Transferencia Bancaria', value: 'Transferencia Bancaria' },
  { key: 'debito', text: 'Tarjeta de Débito', value: 'Tarjeta de Débito' },
  { key: 'credito', text: 'Tarjeta de Crédito', value: 'Tarjeta de Crédito' },
  { key: 'mercado_pago', text: 'Mercado Pago', value: 'Mercado Pago' }
];

const PAYMENT_TABLE_HEADERS = [
  { id: 'method', title: 'Método de Pago', value: (element) => element.method },
  { id: 'amount', title: 'Monto', value: (element) => element.amount.toFixed(2) },
  { id: 'comments', title: 'Comentarios', value: (element) => element.comments }
];

const Field = ({ label, children }) => (
  <>
    <Flex justifyContent="space-between" height="30px">
      <Title as="h4" $slim width="100px" textAlign="right">{label}</Title>
      <Title as="h4" width="120px">{children}</Title>
    </Flex>
  </>
)

const EMPTY_PAYMENT = { method: '', amount: 0, comments: '' };

const ModalConfirmation = ({ isModalOpen, onClose, customer, onConfirm, isLoading }) => {
  const { handleSubmit, control, formState: { errors }, setError, clearErrors } = useForm({ defaultValues: customer });
  const [pickUpInStore, setPickUpInStore] = useState(false);
  const formRef = useRef(null);
  const totalBudget = 1000;
  const [payments, setPayments] = useState([]);
  const [paymentToAdd, setPaymentToAdd] = useState(EMPTY_PAYMENT);

  const handleConfirmClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const handleAddPayment = () => {
    const totalAssigned = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = totalBudget - totalAssigned;

    if (paymentToAdd.amount > remainingAmount) {
      setError("amount", {
        type: "manual",
        message: `El monto no puede exceder el presupuesto restante (${remainingAmount}).`
      });
      return;
    }

    setPayments([...payments, { ...paymentToAdd }]);
    setPaymentToAdd(EMPTY_PAYMENT);
    clearErrors("amount");
  };

  const handlePaymentChange = (field, value) => {
    setPaymentToAdd((prev) => ({
      ...prev,
      [field]: field === 'amount' ? (parseFloat(value) || 0) : value,
    }));
  };

  const handleRemovePayment = (index) => {
    const newPayments = payments.slice();
    newPayments.splice(index, 1);
    setPayments(newPayments);
  };

  const totalAssigned = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = totalBudget - totalAssigned;

  return (
    <Transition visible={isModalOpen} animation='scale' duration={500}>
      <Modal size="large" closeIcon open={isModalOpen} onClose={() => onClose(false)}>
        <Modal.Header>
          <Flex alignItems="center" justifyContent="space-between">
            Desea confirmar el presupuesto?
            <ButtonGroup size="small">
              <IconedButton
                height="32px"
                width="fit-content"
                icon
                labelPosition="left"
                type="button"
                basic={!pickUpInStore}
                color="blue"
                onClick={() => {
                  setPickUpInStore(true);
                }}
              >
                <Icon name="warehouse" />
                {PICK_UP_IN_STORE}
              </IconedButton>
              <IconedButton
                height="32px"
                width="fit-content"
                icon
                labelPosition="left"
                type="button"
                basic={pickUpInStore}
                color="blue"
                onClick={() => {
                  setPickUpInStore(false);
                }}
              >
                <Icon name="truck" />
                Enviar a Dirección
              </IconedButton>
            </ButtonGroup>
          </Flex>
        </Modal.Header>

        <Modal.Content>
          <Form ref={formRef} onSubmit={handleSubmit(() => onConfirm(pickUpInStore))}>
            <FlexColumn rowGap="15px">
              <FieldsContainer>
                <FormField flex="1">
                  <Label>ID</Label>
                  <Segment placeholder alignContent="center" height="40px">{customer?.name}</Segment>
                </FormField>
                <FormField flex="1">
                  <Label>Dirección</Label>
                  <Segment placeholder alignContent="center" height="40px">{!pickUpInStore ? customer?.addresses[0]?.address : PICK_UP_IN_STORE}</Segment>
                </FormField>
                <FormField width="200px">
                  <Label>Teléfono</Label>
                  <Segment placeholder alignContent="center" height="40px">{formatedSimplePhone(customer?.phoneNumbers[0])}</Segment>
                </FormField>
              </FieldsContainer>
              <FieldsContainer width="100%" alignItems="center" rowGap="5px">
                <FormField flex="1">
                  <Label>Método</Label>
                  <Dropdown
                    placeholder='Seleccione método de pago'
                    fluid
                    selection
                    options={PAYMENT_METHODS}
                    value={paymentToAdd.method}
                    onChange={(e, { value }) => handlePaymentChange('method', value)}
                  />
                </FormField>
                <FormField flex="1">
                  <RuledLabel title="Monto" message={errors.amount?.message} required />
                  <Controller
                    name="amount"
                    control={control}
                    rules={{ required: "El monto es requerido" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type='number'
                        placeholder='Monto'
                        value={paymentToAdd.amount === 0 ? '' : paymentToAdd.amount}
                        onChange={(e) => handlePaymentChange('amount', e.target.value)}
                        disabled={!paymentToAdd.method}
                      />
                    )}
                  />
                </FormField>
                <FormField flex="1">
                  <Label>Comentarios</Label>
                  <Input
                    type='text'
                    placeholder='Comentarios'
                    value={paymentToAdd.comments}
                    onChange={(e) => handlePaymentChange('comments', e.target.value)}
                    disabled={!paymentToAdd.method}
                  />
                </FormField>
                <IconedButton
                  size="small"
                  icon
                  labelPosition="left"
                  color="green"
                  type="button"
                  onClick={handleAddPayment}
                  disabled={!paymentToAdd.method}
                >
                  <Icon name="add" />Agregar
                </IconedButton>
              </FieldsContainer>
              <Table
                headers={PAYMENT_TABLE_HEADERS}
                elements={payments}
                actions={[
                  {
                    id: 1,
                    icon: 'trash',
                    color: 'red',
                    onClick: (_, index) => handleRemovePayment(index),
                    tooltip: 'Eliminar'
                  }
                ]}
              />
              <FlexColumn marginLeft="auto" rowGap="5px" width="250px">
                <Field label="Pagado"><Price value={totalAssigned.toFixed(2)} /></Field>
                <Divider />
                <Field label="Pendiente"><Price value={totalPending.toFixed(2)} /></Field>
                <Divider />
                <Field label="Total"><Price value={totalBudget.toFixed(2)} /></Field>
              </FlexColumn>
            </FlexColumn>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <ButtonsContainer width="100%">
            <IconedButton
              icon
              labelPosition="left"
              disabled={isLoading}
              type="button"
              color="red"
              onClick={() => onClose(false)}
            >
              <Icon name='cancel' />
              Cancelar
            </IconedButton>
            <IconedButton
              icon
              labelPosition="left"
              disabled={isLoading || totalAssigned !== totalBudget}
              loading={isLoading}
              type="submit"
              color="green"
              onClick={handleConfirmClick}
            >
              <Icon name='check' />
              Confirmar
            </IconedButton>
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ModalConfirmation;
