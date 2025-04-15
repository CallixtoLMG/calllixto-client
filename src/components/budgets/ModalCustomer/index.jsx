import { useEditCustomer } from "@/api/customers";
import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, FieldsContainer, Form } from "@/common/components/custom";
import { NumberControlled, TextControlled, TextField } from "@/common/components/form";
import { COLORS, ICONS, RULES } from "@/common/constants";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Modal, Transition } from "semantic-ui-react";

const ModalCustomer = ({ isModalOpen, onClose, customer }) => {
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm({ defaultValues: customer });
  const { handleSubmit, reset } = methods;
  const addressRefInputRef = useRef(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const editCustomer = useEditCustomer();

  useEffect(() => {
    if (isModalOpen) {
      const timeout = setTimeout(() => {
        addressRefInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isModalOpen]);

  useEffect(() => {
    reset(customer);
  }, [customer, isModalOpen, reset]);

  useEffect(() => {
    if (isModalOpen) {
      inputRef.current?.focus();
    }
  }, [isModalOpen]);

  const handleEdit = async ({ ref, address, areaCode, number }) => {
    const data = {
      addresses: [{
        ref,
        address
      }],
      phoneNumbers: [{
        areaCode,
        number
      }]
    }
    setIsLoading(true);
    try {
      const response = await editCustomer(data);
      if (response?.data?.statusOk) {
        toast.success('Cliente actualizado!');
      };
      onClose(true, data);
    } catch (error) {
      console.error('Error en la edición del cliente:', error?.message);
      onClose(false);
    } finally {
      setIsLoading(false);
    };
  };

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
          Es necesario completar los siguientes datos del cliente
        </Modal.Header>
        <Modal.Content>
          <FormProvider {...methods}>
            <Form ref={formRef} onSubmit={handleSubmit(handleEdit)}>
              <FieldsContainer>
                <TextField
                  flex="1"
                  label="Nombre"
                  value={customer?.name}
                />
                <TextControlled
                  flex="1"
                  name="ref"
                  rules={RULES.REQUIRED}
                  label="Referencia"
                  ref={addressRefInputRef}
                />
                <TextControlled
                  flex="1"
                  name="address"
                  rules={RULES.REQUIRED}
                  label="Dirección"
                />
                <NumberControlled
                  width="60px"
                  label="Area"
                  name="areaCode"
                  rules={RULES.REQUIRED}
                />
                <NumberControlled
                  width="100px"
                  label="Número"
                  name="number"
                  rules={RULES.REQUIRED}
                />
              </FieldsContainer>
            </Form>
          </FormProvider>
        </Modal.Content>
        <Modal.Actions>
          <ButtonsContainer width="100%">
            <IconedButton
              text="Cancelar"
              icon={ICONS.CANCEL}
              disabled={isLoading}
              color={COLORS.RED}
              onClick={() => onClose(false)}
            />
            <IconedButton
              text="Confirmar"
              icon={ICONS.CHECK}
              disabled={isLoading}
              loading={isLoading}
              color={COLORS.GREEN}
              onClick={handleConfirmClick}
            />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ModalCustomer;
