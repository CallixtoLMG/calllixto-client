"use client";
import { toast } from "react-hot-toast";
import {
  Button,
  Dropdown,
  Form,
  Icon
} from 'semantic-ui-react';
import { Label } from "./styles";
import { useForm } from "react-hook-form";

const BudgetForm = ({ product }) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    toast.success("Producto creado exitosamente");
  };

  const customers = [
    { key: '1', value: 'mi', text: 'Milton' },
    { key: '2', value: 'le', text: 'Levi' },
    { key: '3', value: 'ga', text: 'Gawain' },
    { key: '4', value: 'ma', text: 'Marcelo' },
  ];

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Field>
        <Label>Cliente</Label>
        <Dropdown placeholder='Cliente...'
          search
          selection
          options={customers}
          noResultsMessage="No se encontraron clientes!.."
          name="name"
          {...register("customer")}
          >
        </Dropdown>
      </Form.Field>
      <Button
        type="submit"
        icon
        labelPosition='right'
        color="green"
      >
        <Icon name="add" /> {product?.code ? "Actualizar presupuesto" : "Crear presupuesto"}
      </Button>
    </Form>
  )
};

export default BudgetForm;

