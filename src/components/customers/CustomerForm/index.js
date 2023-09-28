"use client"
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Icon, Input } from 'semantic-ui-react';
import { Label } from "./styles";

const ProductForm = ({ customer, onSubmit }) => {
  const { register, handleSubmit, control } = useForm();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Field>
        <Label>Nombre</Label>
        <Controller
          name="name"
          control={control}
          defaultValue={customer?.name || ""}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Field>
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
        <Icon name="add" /> {customer?.code ? "Actualizar cliente" : "Crear cliente"}
      </Button>
    </Form>
  )
};

export default ProductForm;