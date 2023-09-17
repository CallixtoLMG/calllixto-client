import { toast } from "react-hot-toast";
import { Button, Form, Icon } from 'semantic-ui-react';
import { Label } from "./styles";
import { useForm } from "react-hook-form";

const ProductForm = ({ product }) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    toast.success("Producto creado exitosamente");
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Field>
        <Label>Código</Label>
        <input name="code" placeholder='Código...' {...register("code")} />
      </Form.Field>
      <Form.Field>
        <Label>Nombre</Label>
        <input name="name" placeholder='Nombre...' {...register("name")} />
      </Form.Field>
      <Form.Field>
        <Label>Precio</Label>
        <input name="price" placeholder='Precio...' {...register("price")} />
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