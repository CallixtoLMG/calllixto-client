"use client"
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InputMask from "react-input-mask";
import { Form, Icon } from 'semantic-ui-react';
import { FormContainer, HeaderContainer, ModButton, ModFormField, ModInput, ModLabel } from "./styles";

const CustomerForm = ({ customer, onSubmit }) => {
  const router = useRouter();
  const { handleSubmit, control, reset } = useForm();
  const isUpdating = useMemo(() => !!customer?.id, [customer]);
  const [isLoading, setIsLoading] = useState(false);
  const buttonConfig = useMemo(() => {
    return {
      icon: isUpdating ? "edit" : "add",
      title: isUpdating ? "Actualizar" : "Crear",
    }
  }, [isUpdating]);
  const handleReset = () => {
    reset();
  };
  const handleForm = (data) => {
    if (!customer?.id) {
      onSubmit(data);
    } else {
      onSubmit(customer?.id, data);
    }
    setTimeout(() => {
      router.push(PAGES.CUSTOMERS.BASE);
    }, 1000)
  };

  return (
    <>
      <HeaderContainer>
        <PageHeader title={!customer?.id ? "Crear cliente" : "Actualizar cliente"} />
      </HeaderContainer >
      <FormContainer>
        <Form onSubmit={handleSubmit(handleForm)}>
          <ModFormField>
            <ModLabel >Nombre</ModLabel>
            <Controller
              name="name"
              control={control}
              defaultValue={customer?.name || ""}
              render={({ field }) => <ModInput required {...field} />}
            />
          </ModFormField>
          <ModFormField>
            <ModLabel>Teléfono</ModLabel>
            <InputMask
              mask="999 - 99999999"
              maskChar=""
              value={customer?.phone || ""}
            >
              {(inputProps) => <ModInput {...inputProps} />}
            </InputMask>
          </ModFormField>
          {/* <ModFormField>
            <ModLabel>Teléfono</ModLabel>
            <Controller
              name="phone"
              control={control}
              defaultValue={customer?.phone || ""}
              render={({ field }) => <ModInput {...field} />}
            />
          </ModFormField> */}
          <ModFormField>
            <ModLabel>Email</ModLabel>
            <Controller
              name="email"
              control={control}
              defaultValue={customer?.email || ""}
              render={({ field }) => <ModInput {...field} />}
            />
          </ModFormField>
          <ModFormField>
          </ModFormField>
          <ModButton disabled={isLoading} loading={isLoading} type="submit" color="green" ><Icon name={buttonConfig.icon} />{buttonConfig.title}</ModButton>
          <ModButton type="button" onClick={handleReset} color="brown" $marginLeft><Icon name="erase" />Limpiar cambios</ModButton>
        </Form>
      </FormContainer>
    </>
  )
};

export default CustomerForm;