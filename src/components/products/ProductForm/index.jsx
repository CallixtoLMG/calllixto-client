import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button, Form, Icon, Input } from 'semantic-ui-react';
import { Label } from "./styles";

const ProductForm = ({ product }) => {
  const { register, handleSubmit, control } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    toast.success("Producto creado exitosamente");
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Field>
        <Label>Código</Label>
        <Controller
          name="code"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Field>
      <Form.Field>
        <Label>Nombre</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Field>
      <Form.Field>
        <Label>Precio</Label>
        <Controller
          name="price"
          control={control}
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
        <Icon name="add" /> {product?.code ? "Actualizar producto" : "Crear producto"}
      </Button>
    </Form>
  )
};

export default ProductForm;