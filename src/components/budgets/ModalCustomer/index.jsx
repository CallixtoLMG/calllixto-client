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
  const { handleSubmit, reset, watch, trigger, formState: { isSubmitted } } = methods;
  const addressRefInputRef = useRef(null);
  const formRef = useRef(null);
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

  const handleEdit = async ({ refA, refP, address, areaCode, number }) => {
    const data = {
      id: customer.id,
      name: customer.name,
      addresses: [{
        ref: refA,
        address
      }],
      phoneNumbers: [{
        ref: refP,
        areaCode,
        number
      }]
    }
    setIsLoading(true);
    try {
      const response = await editCustomer(data);
      if (response?.statusOk) {
        toast.success('Cliente actualizado!');
        onClose(true, data);
      } else {
        toast.error('Error al actualizar el cliente.');
      }
    } catch (error) {
      console.error('Error en la edición del cliente:', error?.message);
      toast.error('Error en la edición del cliente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmClick = () => {
    setHasSubmitted(true);
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
                  disabled
                />
              </FieldsContainer>
              <FieldsContainer>
                <TextControlled
                  width="30%"
                  name="refA"
                  rules={RULES.REQUIRED}
                  label="Referencia"
                  ref={addressRefInputRef}
                />
                <TextControlled
                  width="50%"
                  name="address"
                  rules={RULES.REQUIRED}
                  label="Dirección"
                />
              </FieldsContainer>
              <FieldsContainer>
                <TextControlled
                  width="30%"
                  name="refP"
                  rules={RULES.REQUIRED}
                  label="Referencia"
                />
                <NumberControlled
                  width="130px"
                  label="Código de área"
                  placeholder="Ej: 351"
                  name="areaCode"
                  maxLength="4"
                  rules={{
                    required: "El código de área es requerido.",
                    validate: (value) => {
                      const number = watch("number") ?? '';
                      return (value + number).length === 10 || "El área y el número deben sumar 10 dígitos.";
                    },
                  }}
                  onChange={() => isSubmitted && trigger("number")}
                  normalMode
                />
                <NumberControlled
                  width="150px"
                  label="Número de teléfono"
                  name="number"
                  placeholder="Ej: 12345678"
                  rules={{
                    required: "El número de teléfono es requerido.",
                    validate: (value) => {
                      const areaCode = watch("areaCode") ?? '';
                      return (areaCode + value).length === 10 || "El área y el número deben sumar 10 dígitos.";
                    },
                  }}
                  onChange={() => isSubmitted && trigger("areaCode")}
                  maxLength="7"
                  normalMode
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