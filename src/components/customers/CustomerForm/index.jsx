"use client"
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon } from 'semantic-ui-react';
import { MainContainer, ModButton, ModFormField, ModInput, ModLabel } from "./styles";

const CustomerForm = ({ customer, onSubmit }) => {
  const router = useRouter();
  const { handleSubmit, control } = useForm();
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
    <MainContainer>
      <Form onSubmit={handleSubmit(handleForm)}>
        <ModFormField>
          <ModLabel >Nombre</ModLabel>
          <Controller
            name="name"
            control={control}
            defaultValue={customer?.name || ""}
            render={({ field }) => <ModInput {...field} />}
          />
        </ModFormField>
        <ModFormField>
          <ModLabel>Teléfono</ModLabel>
          <Controller
            name="phone"
            control={control}
            defaultValue={customer?.phone || ""}
            render={({ field }) => <ModInput {...field} />}
          />
        </ModFormField>
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
        <ModButton
          type="submit"
          color="green"
        >
          <Icon name="add" /> {customer?.id ? "Actualizar cliente" : "Crear cliente"}
        </ModButton>
      </Form>
    </MainContainer>
  )
};

export default CustomerForm;