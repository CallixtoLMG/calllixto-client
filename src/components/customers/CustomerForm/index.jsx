"use client"
import { PAGES, REGEX } from "@/constants";
import { createDate } from "@/utils";
import { omit } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box } from "rebass";
import { Form, Icon } from 'semantic-ui-react';
import { Button, ButtonsContainer, FieldsContainer, FormContainer, FormField, Input, Label, MaskedInput, PhoneContainer, Textarea } from "./styles";

const CustomerForm = ({ customer, onSubmit }) => {
  const { push } = useRouter();
  const params = useParams();
  const { handleSubmit, control, reset, formState: { isValid, isDirty } } = useForm({ defaultValues: omit(customer, ['id', 'createdAt']) });
  const isUpdating = useMemo(() => !!params.id, [params.id]);
  const [isLoading, setIsLoading] = useState(false);
  const buttonConfig = useMemo(() => {
    return {
      icon: isUpdating ? "edit" : "add",
      title: isUpdating ? "Actualizar" : "Crear",
    }
  }, [isUpdating]);

  const handleForm = (data) => {
    setIsLoading(true);
    if (!isUpdating) {
      data.createdAt = createDate()
      onSubmit(data);
    } else {
      data.updatedAt = createDate()
      onSubmit(params.id, data);
    }
    setTimeout(() => {
      setIsLoading(false);
      push(PAGES.CUSTOMERS.BASE);
    }, 1000)
  };

  const handleReset = useCallback((customer) => {
    reset(customer || { name: '', email: '', phone: { areaCode: '', number: '' }, comments: '' });
  }, [reset]);

  return (
    <>
      <Form onSubmit={handleSubmit(handleForm)}>
        <FormContainer>
          <FieldsContainer>
            <FormField width="300px">
              <Label>Nombre</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <Input required {...field} placeholder="Nombre" />}
              />
            </FormField>
          </FieldsContainer>
          <FieldsContainer>
            <FormField>
              <Label>Email</Label>
              <Controller
                name="email"
                control={control}
                rules={{ required: true, pattern: REGEX.EMAIL }}
                render={({ field }) => <Input required {...field} placeholder="Email" />}
              />
            </FormField>
            <FormField>
              <Label >Dirección</Label>
              <Controller
                name="address"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <Input required {...field} placeholder="Dirección" />}
              />
            </FormField>
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
          </FieldsContainer>
          <FieldsContainer>
            <Label >Comentarios</Label>
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
              disabled={isLoading || !isDirty || !isValid}
              loading={isLoading}
              type="submit"
              color="green"
            >
              <Icon name={buttonConfig.icon} />{buttonConfig.title}
            </Button>
            {isUpdating ? (
              <Button type="button" onClick={() => handleReset(customer)} color="brown" disabled={isLoading || !isDirty}>
                <Icon name="undo" />Restaurar
              </Button>
            ) : (
              <Button type="button" onClick={() => handleReset()} color="brown" disabled={isLoading || !isDirty}>
                <Icon name="erase" />Limpiar
              </Button>
            )}
          </ButtonsContainer>
        </FormContainer >
      </Form >
    </>
  )
};

export default CustomerForm;
