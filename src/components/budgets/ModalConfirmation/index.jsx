import { Button, ButtonsContainer, Checkbox, FieldsContainer, Flex, Form, FormField, Label, Segment } from "@/components/common/custom";
import { PICK_UP_IN_STORE } from "@/constants";
import { formatedSimplePhone } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Transition } from "semantic-ui-react";

const ModalConfirmation = ({ isModalOpen, onClose, customer, onConfirm, isLoading }) => {
  const { handleSubmit } = useForm({ defaultValues: customer });
  const [pickUpInStore, setPickUpInStore] = useState(false);

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
          <Flex justifyContent="space-between">
            Desea confirmar el presupuesto?
            <Checkbox
              toggle
              label={PICK_UP_IN_STORE}
              checked={pickUpInStore}
              onChange={() => {
                setPickUpInStore(!pickUpInStore);
              }}
            />
          </Flex>
        </Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit(() => onConfirm(pickUpInStore))}>
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

export default ModalConfirmation;