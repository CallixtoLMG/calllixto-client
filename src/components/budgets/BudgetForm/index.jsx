"use client";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  Button,
  Form,
  Icon,
  Input,
  Select,
  Table
} from 'semantic-ui-react';
import { ModButton } from "./styles";

const BudgetForm = ({ product }) => {
  const { register, handleSubmit, control } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    toast.success("Producto creado exitosamente");
  };

  const headers = [{
    id: 1, name: ""
  }, {
    id: 2, name: "Producto"
  }, {
    id: 3, name: "Precio unitario"
  }, {
    id: 4, name: "Cantidad"
  }, {
    id: 5, name: "Subtotal"
  }, {
    id: 6, name: "Descuento"
  }, {
    id: 7, name: "Total"
  }, {
    id: 8, name: "Acciones"
  },]

  const customers = [
    { key: '1', value: 'mi', text: 'Milton' },
    { key: '2', value: 'le', text: 'Levi' },
    { key: '3', value: 'ga', text: 'Gawain' },
    { key: '4', value: 'ma', text: 'Marcelo' },
  ];

  const [products, setProducts] = useState([]);
  const [newItem, setNewItem] = useState({});

  const handleClick = () => {
    const updatedItems = [...products, { name: newItem }];
    setProducts(updatedItems);
    setNewItem('');
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Field>
        <Controller
          name="customer"
          control={control}

          render={({
            field: { onChange },
            fieldState: { invalid, isTouched, isDirty, error },
            formState,
          }) =>
            <Select
              placeholder="Clientes..."
              onChange={(data) => "hola"}
              options={customers} />
          }
        />
        <ModButton
          icon
          labelPosition='right'
          color="green"
          type="button"
          onClick={handleClick}
        >
          <Icon name="add" />Agregar producto</ModButton>
        <Table striped compact celled>
          <Table.Header>
            <Table.Row>
              {headers.map((header) => {
                return (
                  <Table.HeaderCell textAlign="center" key={header.id}>{header.name}</Table.HeaderCell>
                )
              })}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {products.map((product) => {
              return (
                <Table.Row>
                  <Table.Cell >1</Table.Cell>
                  <Table.Cell  > <Controller
                    name="name"
                    control={control}
                    render={({ field }) => <Input type="text" fluid transparent {...field} />}
                  /></Table.Cell>
                  <Table.Cell> <Controller
                    name="price"
                    control={control}
                    render={({ field }) => <Input type="number" fluid transparent {...field} />}
                  /></Table.Cell>
                  <Table.Cell> <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => <Input type="number" fluid {...field} />}
                  /></Table.Cell>
                  <Table.Cell> <Controller
                    name="subtotal"
                    control={control}
                    render={({ field }) => <Input type="number" fluid transparent {...field} />}
                  /></Table.Cell>
                  <Table.Cell> <Controller
                    name="discount"
                    control={control}
                    render={({ field }) => <Input type="number" fluid {...field} />}
                  /></Table.Cell>
                  <Table.Cell> <Controller
                    name="total"
                    control={control}
                    render={({ field }) => <Input fluid transparent {...field} />}
                  /></Table.Cell>
                  <Table.Cell>
                    <Link href="/prueba">
                      <Button color='blue' size="tiny">Editar</Button>
                    </Link></Table.Cell>
                </Table.Row>
              )
            })}

          </Table.Body>
        </Table>
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

