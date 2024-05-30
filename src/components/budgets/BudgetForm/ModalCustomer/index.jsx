import { edit } from "@/api/customers";
import { Button, ButtonsContainer, CurrencyFormatInput, FieldsContainer, Form, FormField, Input, Label, PhoneContainer, RuledLabel, Segment } from "@/components/common/custom";
import { RULES } from "@/constants";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Modal, Transition } from "semantic-ui-react";

const ModalCustomer = ({ isModalOpen, onClose, customer }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors, } } = useForm({
    defaultValues: {
      ...customer,
      phoneNumbers: customer?.phoneNumbers.length ? customer.phoneNumbers : [{ areaCode: '', number: '', ref: '' }],
      addresses: customer?.addresses?.length ? customer.addresses : [{ address: '', ref: '' }],
    }
  });

  const { fields: phoneFields } = useFieldArray({
    control,
    name: "phoneNumbers"
  });

  const { fields: addressFields } = useFieldArray({
    control,
    name: "addresses"
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
              {addressFields.map((item, index) => (
                <FormField flex="1" key={item.id}>
                  <RuledLabel title="Dirección" message={errors?.address?.message} required />
                  <Controller
                    name={`addresses[${index}]`}
                    control={control}
                    rules={RULES.REQUIRED}
                    defaultValue={customer?.addresses[0]?.address}
                    render={({ field: { value, onChange, } }) => (
                      <Input
                        value={value.address}
                        placeholder="Dirección"
                        onChange={(e) => {
                          onChange({
                            ...value,
                            address: e.target.value
                          })
                        }}
                      />
                    )}
                  />
                </FormField>))}
              {phoneFields.map((item, index) => (
                <FormField width="200px" key={item.id}>
                  <RuledLabel title="Teléfono" message={errors?.phone?.areaCode?.message || errors?.phone?.number?.message} required />
                  <PhoneContainer>
                    <Controller
                      name={`phoneNumbers[${index}]`}
                      control={control}
                      rules={{
                        validate: {
                          correctLength: (value) => {
                            if (value.areaCode || value.number) {
                              const areaCode = value.areaCode.replace(/[^0-9]/g, '');
                              const number = value.number.replace(/[^0-9]/g, '');
                              return (areaCode.length + number.length === 10) || "El número debe tener 10 caracteres";
                            }
                            return true;
                          }
                        }
                      }}
                      defaultValue={customer?.phoneNumbers[0]?.areaCode}
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <>
                          <CurrencyFormatInput
                            marginTop="5px"
                            shadow
                            height="50px"
                            format="####"
                            width="35%"
                            placeholder="Área"
                            value={value.areaCode}
                            onChange={(e) => {
                              const formattedValue = e.target.value.replace(/[^0-9]/g, '');
                              onChange({
                                ...value,
                                areaCode: formattedValue
                              });
                            }}
                          />
                          <CurrencyFormatInput
                            marginTop="5px"
                            shadow
                            height="50px"
                            format="#######"
                            width="60%"
                            placeholder="Número"
                            value={value.number}
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
                </FormField >))}
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