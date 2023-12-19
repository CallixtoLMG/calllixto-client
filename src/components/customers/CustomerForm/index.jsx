"use client"
import PageHeader from "@/components/layout/PageHeader";
import { PAGES, REGEX } from "@/constants";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon } from 'semantic-ui-react';
import { FormContainer, HeaderContainer, Button, FieldsContainer, Input, Label, FormField, ButtonsContainer, PhoneContainer } from "./styles";
import { Box } from "rebass";

const CustomerForm = ({ customer, onSubmit }) => {
  const router = useRouter();
  const { handleSubmit, control, reset, formState: { isValid, isDirty } } = useForm();
  const isUpdating = useMemo(() => !!customer?.id, [customer]);
  const [isLoading, setIsLoading] = useState(false);
  const buttonConfig = useMemo(() => {
    return {
      icon: isUpdating ? "edit" : "add",
      title: isUpdating ? "Actualizar" : "Crear",
    }
  }, [isUpdating]);

  const handleForm = (data) => {
    setIsLoading(true);
    if (!customer?.id) {
      onSubmit(data);
    } else {
      onSubmit(customer?.id, data);
    }
    setTimeout(() => {
      setIsLoading(false);
      router.push(PAGES.CUSTOMERS.BASE);
    }, 1000)
  };

  return (
    <>
      <HeaderContainer>
        <PageHeader title={!customer?.id ? "Crear cliente" : "Actualizar cliente"} />
      </HeaderContainer >
      <Form onSubmit={handleSubmit(handleForm)}>
        <FormContainer>
          <FieldsContainer>
            <FormField>
              <Label >Nombre</Label>
              <Controller
                name="name"
                control={control}
                defaultValue={customer?.name || ""}
                rules={{ required: true }}
                render={({ field }) => <Input required {...field} placeholder="Nombre" />}
              />
            </FormField>
            <FormField>
              <Label>Email</Label>
              <Controller
                name="email"
                control={control}
                defaultValue={customer?.email || ""}
                rules={{ required: true, pattern: REGEX.EMAIL }}
                render={({ field }) => <Input {...field} />}
              />
            </FormField>
            <FormField width="300px">
              <Label>Teléfono</Label>
              <PhoneContainer>
                <Box width="100px">
                  <Controller
                    name="phone.areaCode"
                    control={control}
                    render={({ field }) => <Input {...field} placeholder="Área" />}
                  />
                </Box>
                <Box width="300px">
                  <Controller
                    name="phone.number"
                    control={control}
                    render={({ field }) => <Input {...field} placeholder="Número" />}
                  />
                </Box>
              </PhoneContainer>
            </FormField>
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
            <Button type="button" onClick={reset} color="brown">
              <Icon name="erase" />Limpiar
            </Button>
          </ButtonsContainer>
        </FormContainer >
      </Form>
    </>
  )
};

export default CustomerForm;