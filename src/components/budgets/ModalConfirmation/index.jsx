import { ButtonsContainer, FieldsContainer, Flex, FlexColumn, FormField, IconedButton, Label, Segment } from "@/components/common/custom";
import PaymentMethods from "@/components/common/form/PaymentMethods";
import { PICK_UP_IN_STORE } from "@/constants";
import { formatedSimplePhone } from "@/utils";
import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ButtonGroup, Form, Icon, Modal, Transition } from "semantic-ui-react";

const EMPTY_PAYMENT = { method: '', ammount: 0, comments: '' };

const ModalConfirmation = ({ isModalOpen, onClose, customer, onConfirm, isLoading, total }) => {
  const methods = useForm({
    defaultValues: { paymentToAdd: EMPTY_PAYMENT, payments: [], ...customer },
  });

  const formRef = useRef(null);
  const simpleTotal = Number(total.toFixed(2))
  const [totals, setTotals] = useState({ totalAssigned: 0, totalPending: total });
  const handleConfirmClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const handleFinalConfirm = (data) => {
    const { payments, pickUpInStore } = data;
    const dataToSend = {
      paymentsMade: payments.map((payment) => ({
        ammount: payment.ammount,
        method: payment.method,
        comments: payment.comments,
      })),
      total: totals.totalAssigned,
      pickUpInStore,
    };
    onConfirm(dataToSend);
  };

  const handlePickupInStoreChange = (value) => {
    methods.reset({
      ...methods.getValues(),
      pickUpInStore: value,
    });
  };

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
                basic={!methods.getValues("pickUpInStore")}
                color="blue"
                onClick={() => handlePickupInStoreChange(true)}
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
                basic={methods.getValues("pickUpInStore")}
                color="blue"
                onClick={() => handlePickupInStoreChange(false)}
              >
                <Icon name="truck" />
                Enviar a Dirección
              </IconedButton>
            </ButtonGroup>
          </Flex>
        </Modal.Header>
        <Modal.Content>
          <FormProvider {...methods}>
            <Form ref={formRef} onSubmit={methods.handleSubmit(handleFinalConfirm)}>
              <FlexColumn rowGap="15px">
                <FieldsContainer>
                  <FormField flex="1">
                    <Label>ID</Label>
                    <Segment placeholder alignContent="center" height="40px">{customer?.name}</Segment>
                  </FormField>
                  <FormField flex="1">
                    <Label>Dirección</Label>
                    <Segment placeholder alignContent="center" height="40px">{!methods.getValues("pickUpInStore") ? customer?.addresses[0]?.address : PICK_UP_IN_STORE}</Segment>
                  </FormField>
                  <FormField width="200px">
                    <Label>Teléfono</Label>
                    <Segment placeholder alignContent="center" height="40px">{formatedSimplePhone(customer?.phoneNumbers[0])}</Segment>
                  </FormField>
                </FieldsContainer>
                <PaymentMethods totalBudget={simpleTotal} onTotalsChange={setTotals} excludeDollars />
              </FlexColumn>
            </Form>
          </FormProvider>
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
              disabled={isLoading}
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