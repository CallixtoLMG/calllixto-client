import { ButtonsContainer, FieldsContainer, Form, FormField, Label, Segment } from "@/components/common/custom";
import { formatedSimplePhone } from "@/utils";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button, Icon, Modal, Transition } from "semantic-ui-react";

const ModalConfirmation = ({ isModalOpen, onClose, customer, onConfirm, isLoading }) => {
  const { handleSubmit } = useForm({ defaultValues: customer });

  const inputRef = useRef(null);
  useEffect(() => {
    if (isModalOpen) {
      inputRef.current?.focus();
    }
  }, [isModalOpen]);

  return (
    <Transition visible={isModalOpen} animation='scale' duration={500}>
      <Modal
        closeIcon
        open={isModalOpen}
        onClose={() => onClose(false)}
      >
        <Modal.Header>
          Desea confirmar el presupuesto?
        </Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit(onConfirm)}>
            <FieldsContainer>
              <FormField flex="1">
                <Label>ID</Label>
                <Segment alignContent="center" height="40px">{customer?.name}</Segment>
              </FormField>
              <FormField flex="1">
                <Label>Dirección</Label>
                <Segment alignContent="center" height="40px">{customer?.addresses[0]?.address}</Segment>
              </FormField>
              <FormField width="200px">
                <Label>Teléfono</Label>
                <Segment alignContent="center" height="40px">{formatedSimplePhone(customer?.phoneNumbers[0])}</Segment>
              </FormField >
              <ButtonsContainer width="100%" marginTop="10px">
                <Button
                  icon
                  labelPosition="left"
                  disabled={isLoading}
                  type="button"
                  color="red"
                  onClick={() => onClose(false)}
                >
                  <Icon name='cancel' />
                  Cancelar
                </Button>
                <Button
                  icon
                  labelPosition="left"
                  disabled={isLoading}
                  loading={isLoading}
                  type="submit"
                  color="green"
                >
                  <Icon name='check' />
                  Confirmar
                </Button>
              </ButtonsContainer>
            </FieldsContainer>
          </Form>
        </Modal.Content>
      </Modal>
    </Transition>)
};

export default ModalConfirmation;