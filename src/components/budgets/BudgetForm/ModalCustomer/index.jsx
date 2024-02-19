import { edit } from "@/api/customers";
import { Button, ButtonsContainer, FieldsContainer, Form, FormField, Input, Label, MaskedInput, PhoneContainer, RuledLabel, Segment } from "@/components/common/custom";
import { RULES } from "@/constants";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box } from "rebass";
import { Modal, Transition } from "semantic-ui-react";

const ModalCustomer = ({ isModalOpen, onClose, customer }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors, } } = useForm({
    defaultValues: customer
  });

  const inputRef = useRef(null);
  useEffect(() => {
    if (isModalOpen) {
      inputRef.current?.focus();
    }
  }, [isModalOpen]);


  const handleEdit = async (data) => {
    setIsLoading(true);
    try {
      await edit(data);
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
          Es necesario tener los siguientes datos del cliente:
        </Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit(handleEdit)}>
            <FieldsContainer>
              <FormField flex="1">
                <Label>ID</Label>
                <Controller
                  name="name"
                  control={control}
                  defaultValue={customer?.name}
                  render={({ field: { value } }) => <Segment height="40px">{value}</Segment>}
                />
              </FormField>
              <FormField flex="1">
                <RuledLabel title="Dirección" message={errors?.address?.message} required />
                <Controller
                  name="address"
                  control={control}
                  rules={RULES.REQUIRED}
                  defaultValue={customer?.address}
                  render={({ field }) => <Input {...field} />}
                />
              </FormField>
              <FormField width="200px">
                <RuledLabel title="Teléfono" message={errors?.phone?.areaCode?.message || errors?.phone?.number?.message} required />
                <PhoneContainer>
                  <Box width="70px">
                    <Controller
                      name="phone.areaCode"
                      control={control}
                      rules={RULES.PHONE.AREA_CODE_REQUIRED}
                      defaultValue={customer?.phone.areaCode}
                      render={({ field }) =>
                        <MaskedInput
                          mask="9999"
                          maskChar={null}
                          {...field}
                          placeholder="Área"
                        />
                      }
                    />
                  </Box>
                  <Box width="130px">
                    <Controller
                      name="phone.number"
                      control={control}
                      rules={RULES.PHONE.NUMBER_REQUIRED}
                      defaultValue={customer?.phone.number}
                      render={({ field }) =>
                        <MaskedInput
                          mask="99999999"
                          maskChar={null}
                          {...field}
                          placeholder="Número"
                        />}
                    />
                  </Box>
                </PhoneContainer>
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
    </Transition >)
}

export default ModalCustomer;