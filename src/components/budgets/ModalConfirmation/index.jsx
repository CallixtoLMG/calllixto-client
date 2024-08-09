import { IconnedButton } from "@/components/common/buttons";
import { ButtonsContainer, FieldsContainer, Flex, Form, FormField, Label, Segment } from "@/components/common/custom";
import { PICK_UP_IN_STORE } from "@/constants";
import { formatedSimplePhone } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ButtonGroup, Modal, Transition } from "semantic-ui-react";

const ModalConfirmation = ({ isModalOpen, onClose, customer, onConfirm, isLoading }) => {
  const { handleSubmit } = useForm({ defaultValues: customer });
  const [pickUpInStore, setPickUpInStore] = useState(false);
  const formRef = useRef(null);

  const inputRef = useRef(null);
  useEffect(() => {
    if (isModalOpen) {
      inputRef.current?.focus();
    }
  }, [isModalOpen]);

  const handleConfirmClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <Transition visible={isModalOpen} animation='scale' duration={500}>
      <Modal
        closeIcon
        open={isModalOpen}
        onClose={() => onClose(false)}
      >
        <Modal.Header>
          <Flex alignItems="center" justifyContent="space-between">
            Desea confirmar el presupuesto?
            <ButtonGroup size="small">
              <IconnedButton
                text={PICK_UP_IN_STORE}
                icon="warehouse"
                height="32px"
                basic={!pickUpInStore}
                onClick={() => {
                  setPickUpInStore(true);
                }}
              />
              <IconnedButton
                text="Enviar a Dirección"
                icon="truck"
                height="32px"
                basic={pickUpInStore}
                onClick={() => {
                  setPickUpInStore(false);
                }}
              />
            </ButtonGroup>
          </Flex>
        </Modal.Header>
        <Modal.Content>
          <Form ref={formRef} onSubmit={handleSubmit(() => onConfirm(pickUpInStore))}>
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
              </FormField >
            </FieldsContainer>
          </Form>
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
    </Transition>)
};

export default ModalConfirmation;