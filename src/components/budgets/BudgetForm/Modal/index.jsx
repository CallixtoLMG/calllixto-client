import { edit } from "@/api/customers";
import { SubmitAndRestore } from "@/components/common/buttons";
import { Button, ButtonsContainer, FieldsContainer, Form, FormField, Input, Label, MaskedInput, PhoneContainer, RuledLabel, Segment } from "@/components/common/custom";
import { RULES } from "@/constants";
import { formatedPhone } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box } from "rebass";
import { Modal, Transition } from "semantic-ui-react";

const ModalBudget = ({ setIsConfirmChecked, isModalOpen, readonly, isOpen, isClose, customer }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, setValue, setError, watch, reset, formState: { isDirty, errors, isSubmitted } } = useForm({
    // defaultValues: budget ? {
    //   ...budget,
    //   seller: `${user?.firstName} ${user?.lastName}`
    // } : EMPTY_BUDGET(user),
  });

  const inputRef = useRef(null);
  useEffect(() => {
    if (isModalOpen) {
      // Enfoca el input después de que el modal se haya abierto
      inputRef.current?.focus();
    }
  }, [isModalOpen]);


  const handleEdit = async (data) => {
    const { id, name, email, createdAt, comments } = customer;
    const combinedData = {
      id,
      name,
      email,
      phone: data.phone,
      address: data.address,
      createdAt,
      comments
    };
    setIsLoading(true);
    try {
      // Aquí asumimos que la función edit retorna una Promesa
      await edit(combinedData);
      setIsConfirmChecked(true)
    } catch (error) {
      console.error('Error durante la operación:', error.message);
    } finally {
      setIsLoading(false);
      isClose(isModalOpen);
    }
  };

  return (
    <Transition visible={isModalOpen} animation='scale' duration={500}>
      <Modal
        closeIcon
        open={isModalOpen}
        onClose={isClose}
      >
        <Modal.Header>
          {!customer.address || !customer.phone ?
            "Es necesario tener los siguientes datos del cliente:" :
            "Desea confirmar el presupuesto?"}
        </Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit(handleEdit)}>
            <FieldsContainer>
              <FormField flex="1">
                <Label>ID del Cliente</Label>
                <Controller
                  name="name"
                  control={control}
                  defaultValue={customer.name}
                  render={({ field: { value } }) => <Segment>{value}</Segment>}
                />
              </FormField>
              <FormField flex="1">
                <RuledLabel title="Dirección del Cliente" message={errors?.customer?.address?.message} required />
                <Controller
                  name="address"
                  control={control}
                  rules={RULES.REQUIRED}
                  defaultValue={customer.address}
                  render={({ field }) => <Input {...field} />}
                />
              </FormField>
              <FormField width="200px">
                <RuledLabel title="Teléfono del Cliente" message={errors?.customerPhone?.areaCode?.message} required />
                {!customer.phone.areaCode ?
                  (<PhoneContainer>
                    <Box width="70px">
                      <Controller
                        name="phone.areaCode"
                        control={control}
                        rules={RULES.PHONE.AREA_CODE}
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
                        rules={RULES.PHONE.NUMBER}
                        render={({ field }) =>
                          <MaskedInput
                            mask="99999999"
                            maskChar={null}
                            {...field}
                            placeholder="Número"
                          />}
                      />
                    </Box>
                  </PhoneContainer>)
                  : (<Segment>{customer.phone ? formatedPhone(customer?.phone?.areaCode, customer?.phone?.number) : ""}</Segment>)}
              </FormField >
              <ButtonsContainer width="100%" marginTop="10px">
                <Button
                  type="submit"
                  color="green"
                >
                  Confirmar
                </Button>
                <Button color="red" onClick={isClose}>
                  Cancelar
                </Button>
              </ButtonsContainer>
              <SubmitAndRestore
                show={!readonly}
                isLoading={isLoading}
                isDirty={isDirty}
              // onClick={handleReset}
              />
            </FieldsContainer>
          </Form>
        </Modal.Content>
      </Modal>
    </Transition>)
}

export default ModalBudget;