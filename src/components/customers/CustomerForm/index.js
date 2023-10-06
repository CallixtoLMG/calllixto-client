"use client"
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Icon } from 'semantic-ui-react';
import { MainContainer, ModFormField, ModInput, ModLabel } from "./styles";

const CustomerForm = ({ customer, onSubmit }) => {
  const { handleSubmit, control } = useForm();

  return (
    <MainContainer>
      <Form onSubmit={handleSubmit(onSubmit)}>
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
        <Button
          type="submit"
          icon
          labelPosition='right'
          color="green"
        >
          <Icon name="add" /> {customer?.id ? "Actualizar cliente" : "Crear cliente"}
        </Button>
      </Form>
    </MainContainer>
  )
};

export default CustomerForm;