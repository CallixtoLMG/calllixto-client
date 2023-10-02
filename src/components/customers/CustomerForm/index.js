"use client"
import { editCustomer } from "@/app/clientes/page";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Icon, Input } from 'semantic-ui-react';
import { Label, MainContainer } from "./styles";

const CustomerForm = ({ customer, create }) => {
  const { register, handleSubmit, control } = useForm();

  return (
    <MainContainer>
      <Form onSubmit={customer?.id ? handleSubmit(() => editCustomer(customer.id)) : handleSubmit(create)}>
        {!customer?.id &&
          <Form.Field>
            <Label>Nombre</Label>
            <Controller
              name="name"
              control={control}
              defaultValue={customer?.name || ""}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Field>}
        <Form.Field>
          <Label>Teléfono</Label>
          <Controller
            name="phone"
            control={control}
            defaultValue={customer?.phone || ""}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Field>
        <Form.Field>
          <Label>Email</Label>
          <Controller
            name="email"
            control={control}
            defaultValue={customer?.email || ""}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Field>
        <Form.Field>
        </Form.Field>
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