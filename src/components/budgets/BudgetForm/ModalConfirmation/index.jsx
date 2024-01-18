import { edit } from "@/api/budgets";
import { Button, ButtonsContainer, FieldsContainer, Form, FormField, Label, Segment } from "@/components/common/custom";
import { useUserData } from "@/hooks/userData";
import { formatedPhone, now } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Transition } from "semantic-ui-react";

const ModalCustomer = ({ isModalOpen, onClose, customer, budgetId }) => {
  const user = useUserData();
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit } = useForm({
    defaultValues: customer
  });

  const inputRef = useRef(null);
  useEffect(() => {
    if (isModalOpen) {
      inputRef.current?.focus();
    }
  }, [isModalOpen]);

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      const confirmationData = { confirmedBy: `${user.firstName} ${user.lastName}`, confirmedAt: now() };
      await edit(confirmationData, budgetId);
      onClose(true)
    } catch (error) {
      console.error('Error en la edición del presupuesto:', error.message);
      onClose(false);
    } finally {
      setIsLoading(false);
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
          Desea confirmar el presupuesto?
        </Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit(handleEdit)}>
            <FieldsContainer>
              <FormField flex="1">
                <Label>ID del Cliente</Label>
                <Segment>{customer.name}</Segment>
              </FormField>
              <FormField flex="1">
                <Label>Dirección del Cliente</Label>
                <Segment>{customer.address}</Segment>
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