import { IconnedButton } from "@/components/common/buttons";
import { ButtonsContainer, FieldsContainer, Flex, FlexColumn, FormField, Label, Segment } from "@/components/common/custom";
import PaymentMethods from "@/components/common/form/PaymentMethods";
import { PICK_UP_IN_STORE } from "@/constants";
import { formatedSimplePhone, now } from "@/utils";
import { useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ButtonGroup, Form, Modal, Transition } from "semantic-ui-react";

const EMPTY_PAYMENT = { method: '', amount: 0, comments: '' };

const ModalConfirmation = ({ isModalOpen, onClose, customer, onConfirm, isLoading, subtotal, subtotalAfterDiscount, finalTotal }) => {
  const methods = useForm({
    defaultValues: { paymentToAdd: EMPTY_PAYMENT, payments: [], ...customer },
  });

  const formRef = useRef(null);
  const roundedFinalTotal = parseFloat(finalTotal.toFixed(2));
  const handleConfirmClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const handleFinalConfirm = (data) => {
    const { payments, pickUpInStore } = data;
    const dataToSend = {
      paymentsMade: payments?.map((payment) => ({
        amount: payment.amount,
        method: payment.method,
        comments: payment.comments,
        createdAt: now()
      })),
      total: roundedFinalTotal,
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
              <IconnedButton
                text={PICK_UP_IN_STORE}
                icon="warehouse"
                height="32px"
                basic={!methods.getValues("pickUpInStore")}
                onClick={() => handlePickupInStoreChange(true)}
              />
              <IconnedButton
                text="Enviar a Dirección"
                icon="truck"
                height="32px"
                basic={methods.getValues("pickUpInStore")}
                onClick={() => handlePickupInStoreChange(false)}
              />
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
                <PaymentMethods
                  subtotal={subtotal}
                  finalTotal={roundedFinalTotal}
                  subtotalAfterDiscount={subtotalAfterDiscount}
                  excludeDollars
                  maxHeight />
              </FlexColumn>
            </Form>
          </FormProvider>
        </Modal.Content>
        <Modal.Actions>
          <ButtonsContainer width="100%">
            <IconnedButton
              text="Cancelar"
              icon="cancel"
              disabled={isLoading}
              color="red"
              onClick={() => onClose(false)}
            />
            <IconnedButton
              text="Confirmar"
              icon="check"
              disabled={isLoading}
              loading={isLoading}
              submit
              color="green"
              onClick={handleConfirmClick}
            />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ModalConfirmation;