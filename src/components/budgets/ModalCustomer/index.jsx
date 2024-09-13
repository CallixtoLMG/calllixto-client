import { edit } from "@/api/customers";
import { IconnedButton } from "@/components/common/buttons";
import { ButtonsContainer, CurrencyFormatInput, FieldsContainer, Form, FormField, Input, Label, PhoneContainer, RuledLabel, Segment } from "@/components/common/custom";
import { COLORS, RULES } from "@/constants";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Modal, Transition } from "semantic-ui-react";

const ModalCustomer = ({ isModalOpen, onClose, customer }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: customer });
  const formRef = useRef(null);

  useEffect(() => {
    reset(customer);
  }, [customer, isModalOpen, reset]);

  const inputRef = useRef(null);
  useEffect(() => {
    if (isModalOpen) {
      inputRef.current?.focus();
    }
  }, [isModalOpen]);

  const handleEdit = async (data) => {
    setIsLoading(true);
    try {
      const response = await edit(data);
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
          <Form ref={formRef} onSubmit={handleSubmit(handleEdit)}>
            <FieldsContainer>
              <FormField flex="1">
                <Label>Nombre</Label>
                <Segment height="40px" placeholder>{customer?.name}</Segment>
              </FormField>
              <FormField flex="1" error={errors?.addresses?.message}>
                <RuledLabel title="Dirección" message={errors?.addresses?.message} required />
                <Controller
                  name="addresses"
                  control={control}
                  rules={RULES.REQUIRED}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Input
                      {...rest}
                      value={value?.[0]?.address || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) {
                          onChange(undefined);
                          return;
                        }
                        onChange([{ address: e.target.value }])
                      }}
                      placeholder="Dirección"
                    />
                  )}
                />
              </FormField>
              <FormField width="200px" error={errors?.phoneNumbers?.[0]?.message}>
                <RuledLabel title="Teléfono" message={errors?.phoneNumbers?.[0]?.message} required />
                <PhoneContainer>
                  <Controller
                    name="phoneNumbers?.[0]"
                    control={control}
                    rules={{
                      validate: {
                        correctLength: (value) => {
                          if (!value?.areaCode || !value?.number) return 'Un teléfono es requerido';
                          if (value?.areaCode || value?.number) {
                            const areaCode = value.areaCode.replace(/[^0-9]/g, '');
                            const number = value.number.replace(/[^0-9]/g, '');
                            return (areaCode.length + number.length === 10) || "El número debe tener 10 caracteres";
                          }
                          return true;
                        }
                      }
                    }}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                      <>
                        <CurrencyFormatInput
                          $shadow
                          height="50px"
                          format="####"
                          width="35%"
                          placeholder="Área"
                          value={value?.areaCode}
                          onChange={(e) => {
                            const formattedValue = e.target.value.replace(/[^0-9]/g, '');
                            onChange({
                              ...value,
                              areaCode: formattedValue
                            });
                          }}
                        />
                        <CurrencyFormatInput
                          $shadow
                          height="50px"
                          format="#######"
                          width="60%"
                          placeholder="Número"
                          value={value?.number}
                          onChange={(e) => {
                            const formattedValue = e.target.value.replace(/[^0-9]/g, '');
                            onChange({
                              ...value,
                              number: formattedValue
                            });
                          }}
                        />
                      </>
                    )}
                  />
                </PhoneContainer>
              </FormField>
            </FieldsContainer>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <ButtonsContainer width="100%">
            <IconnedButton
              text="Cancelar"
              icon={ICONS.CANCEL}
              disabled={isLoading}
              color={COLORS.RED}
              onClick={() => onClose(false)}
            />
            <IconnedButton
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
