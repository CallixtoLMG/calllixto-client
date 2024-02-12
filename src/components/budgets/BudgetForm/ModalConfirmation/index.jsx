import { Button, ButtonsContainer, FieldsContainer, Form, FormField, Label, Segment } from "@/components/common/custom";
import { formatedPhone } from "@/utils";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Modal, Transition } from "semantic-ui-react";

const ModalCustomer = ({ isModalOpen, onClose, customer, onConfirm, isLoading }) => {
  const { handleSubmit } = useForm({
    defaultValues: customer
  });

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
                <Label>ID del Cliente</Label>
                <Segment>{customer?.name}</Segment>
              </FormField>
              <FormField flex="1">
                <Label>Dirección del Cliente</Label>
                <Segment>{customer?.address}</Segment>
              </FormField>
              <FormField width="200px">
                <Label>Teléfono del Cliente</Label>
                <Segment>{formatedPhone(customer?.phone?.areaCode, customer?.phone?.number)}</Segment>
              </FormField >
              <ButtonsContainer width="100%" marginTop="10px">
                <Button
                  disabled={isLoading}
                  loading={isLoading}
                  type="submit"
                  color="green"
                >
                  Confirmar
                </Button>
                <Button
                  disabled={isLoading}
                  type="button"
                  color="red"
                  onClick={() => onClose(false)}>
                  Cancelar
                </Button>
              </ButtonsContainer>
            </FieldsContainer>
          </Form>
        </Modal.Content>
      </Modal>
    </Transition>)
};

export default ModalCustomer;