import { edit } from "@/api/customers";
import { Button, ButtonsContainer, Checkbox, CurrencyFormatInput, FieldsContainer, Flex, Form, FormField, Input, Label, PhoneContainer, RuledLabel, Segment } from "@/components/common/custom";
import { PICK_UP_IN_STORE, RULES } from "@/constants";
import { formatedSimplePhone } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Modal, Transition } from "semantic-ui-react";

const ModalCustomer = ({ isModalOpen, onClose, customer, pickUpInStore, setPickUpInStore }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: customer });

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
      }
      onClose(true, data);
    } catch (error) {
      console.error('Error en la edición del cliente:', error?.message);
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
          <Flex justifyContent="space-between">
            Es necesario completar los siguientes datos del cliente
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
          <Form onSubmit={handleSubmit(handleEdit)}>
            <FieldsContainer>
              <FormField flex="1">
                <Label>Nombre</Label>
                <Segment height="40px">{customer?.name}</Segment>
              </FormField>
              <FormField flex="1">
                {!!customer?.addresses.length ? (
                  <>
                    <Label>Dirección</Label>
                    <Segment>{customer.addresses[0]?.address}</Segment>
                  </>
                ) : (
                  <>
                    <RuledLabel title="Dirección" message={!pickUpInStore && errors?.addresses && errors.addresses[0]?.message} required={!pickUpInStore} />
                    <Controller
                      name={`addresses[0]`}
                      control={control}
                      rules={!pickUpInStore && RULES.REQUIRED}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <Input
                          {...rest}
                          value={!pickUpInStore ? (value?.address || '') : PICK_UP_IN_STORE}
                          onChange={(e) => {
                            onChange({ address: e.target.value })
                          }}
                          placeholder="Dirección"
                        />
                      )}
                    />
                  </>
                )}
              </FormField>
              <FormField width="200px">
                {!!customer?.phoneNumbers[0] ? (
                  <>
                    <Label>Teléfono</Label>
                    <Segment>{formatedSimplePhone(customer.phoneNumbers[0])}</Segment>
                  </>
                ) : (
                  <>
                    <RuledLabel title="Teléfono" message={errors?.phoneNumbers && errors.phoneNumbers[0]?.message} required />
                    <PhoneContainer>
                      <Controller
                        name={`phoneNumbers[0]`}
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
                              $marginY
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
                              $marginY
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
                  </>
                )}
              </FormField>
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
    </Transition >)
}

export default ModalCustomer;