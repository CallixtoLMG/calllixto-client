import { ButtonsContainer, FieldsContainer, Flex, Form, FormField, IconedButton, Label, Segment } from "@/components/common/custom";
import { PICK_UP_IN_STORE } from "@/constants";
import { formatedSimplePhone } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ButtonGroup, Icon, Modal, Transition } from "semantic-ui-react";

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
    </Transition>)
};

export default ModalConfirmation;