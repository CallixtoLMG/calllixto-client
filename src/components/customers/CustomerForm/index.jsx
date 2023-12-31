"use client"
import { PAGES, REGEX } from "@/constants";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box } from "rebass";
import { Form, Icon } from 'semantic-ui-react';
import { Button, ButtonsContainer, FormField, Input, Label, MaskedInput, PhoneContainer, Textarea } from "./styles";
import { RuledLabel } from "@/components/common/custom";
import { FormContainer, FieldsContainer } from "@/components/common/custom";

const CustomerForm = ({ customer, onSubmit }) => {
  const { push } = useRouter();
  const params = useParams();
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({ defaultValues: customer });
  const isUpdating = useMemo(() => !!params.id, [params.id]);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = useCallback((customer) => {
    reset(customer || { name: '', email: '', phone: { areaCode: '', number: '' }, comments: '' });
  }, [reset]);

  const buttonConfig = useMemo(() => {
    return {
      submit: {
        icon: isUpdating ? "edit" : "add",
        title: isUpdating ? "Actualizar" : "Crear",
      },
      restore: {
        onClick: () => handleReset(isUpdating ? customer : null),
        icon: isUpdating ? 'undo' : 'erase',
        title: isUpdating ? 'Restaurar' : 'Limpiar'
      }
    }
  }, [customer, handleReset, isUpdating]);

  const handleForm = (data) => {
    setIsLoading(true);
    onSubmit(data);
    setTimeout(() => {
      setIsLoading(false);
      push(PAGES.CUSTOMERS.BASE);
    }, 2000);
  };

  return (
    <>
      <Form onSubmit={handleSubmit(handleForm)}>
        <FormContainer>
          <FieldsContainer>
            <FormField width="50%!important">
              <RuledLabel title="Nombre" message={errors?.name?.message} required />
              <Controller
                name="name"
                control={control}
                rules={{ required: 'El nombre es requerido' }}
                render={({ field }) => <Input {...field} placeholder="Nombre" />}
              />
            </FormField>
          </FieldsContainer>
          <FieldsContainer>
            <FormField flex="none" width="200px">
              <Label>Teléfono</Label>
              <PhoneContainer>
                <Box width="70px">
                  <Controller
                    name="phone.areaCode"
                    control={control}
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
                    render={({ field }) =>
                      <MaskedInput
                        mask="99999999"
                        maskChar={null}
                        {...field}
                        placeholder="Numero"
                      />}
                  />
                </Box>
              </PhoneContainer>
            </FormField>
            <FormField flex="1">
              <RuledLabel title="Email" message={errors?.email?.message} />
              <Controller
                name="email"
                control={control}
                rules={{ pattern: { value: REGEX.EMAIL, message: 'Ingresar un mail válido' } }}
                render={({ field }) => <Input {...field} placeholder="nombre@mail.com" />}
              />
            </FormField>
            <FormField flex="1">
              <Label>Dirección</Label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Dirección" />}
              />
            </FormField>
          </FieldsContainer>
          <FieldsContainer>
            <Label>Comentarios</Label>
            <Controller
              name="comments"
              control={control}
              render={({ field }) => (
                <Textarea maxLength="2000" {...field} placeholder="Comentarios" />
              )}
            />
          </FieldsContainer>
          <ButtonsContainer>
            <Button
              disabled={isLoading || !isDirty}
              loading={isLoading}
              type="submit"
              color="green"
            >
              <Icon name={buttonConfig.submit.icon} />{buttonConfig.submit.title}
            </Button>
            <Button type="button" onClick={buttonConfig.restore.onClick} color="brown" disabled={isLoading || !isDirty}>
              <Icon name={buttonConfig.restore.icon}/>{buttonConfig.restore.title}
            </Button>
          </ButtonsContainer>
        </FormContainer>
      </Form>
    </>
  )
};

export default CustomerForm;
