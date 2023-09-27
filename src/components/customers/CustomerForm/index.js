"use client"
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button, Form, Icon, Input } from 'semantic-ui-react';
import { Label } from "./styles";

const ProductForm = ({ customer }) => {
  const router = useRouter();
  const { register, handleSubmit, control } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    toast.success("Cliente creado exitosamente");
    router.push("/clientes");
  };

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
        <Label>Telefono</Label>
        <Controller
          name="tel"
          control={control}
          defaultValue={customer?.tel || ""}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Field>
      <Form.Field>
        <Label>Email</Label>
        <Controller
          name="mail"
          control={control}
          defaultValue={customer?.mail || ""}
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