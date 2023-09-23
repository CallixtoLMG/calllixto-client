"use client";
// import ButtonDelete from "@/components/ButtonDelete";
import Prueba from "@/components/Prueba";
// import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
// import { Controller, useForm } from "react-hook-form";

import { toast } from "react-hot-toast";
// import {
//   Form,
//   Icon,
//   Table
// } from 'semantic-ui-react';
// import { ModButtonBudget, ModButtonProduct, ModDropdown } from "./styles";

const BudgetForm = () => {
  const { handleSubmit, control, setValue, getValues } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    toast.success("Producto creado exitosamente");
  };

  const productos = [
    {
      code: 1,
      name: "Madera",
      price: 150,
      key: 1,
      value: "Madera",
      text: "Madera"
    },
    {
      code: 2,
      name: "Piedra",
      price: 250,
      key: 2,
      value: "Piedra",
      text: "Piedra"
    },
    {
      code: 3,
      name: "Ripio",
      price: 450,
      key: 3,
      value: "Ripio",
      text: "Ripio"
    }
  ];


  const headers = [{
    id: 1, name: ""
  }, {
    id: 2, name: "Nombre del producto"
  }, {
    id: 3, name: "Precio unitario"
  }, {
    id: 4, name: "Cantidad"
  }, {
    id: 5, name: "Subtotal"
  }, {
    id: 6, name: "Descuento %"
  }, {
    id: 7, name: "Total"
  }, {
    id: 8, name: "Acciones"
  },]

  const customers = [
    { key: '1', value: 'Milton', text: 'Milton' },
    { key: '2', value: 'Levi', text: 'Levi' },
    { key: '3', value: 'Gawain', text: 'Gawain' },
    { key: '4', value: 'Marcelo', text: 'Marcelo' },
  ];

  const [products, setProducts] = useState([]);
  const [newItem, setNewItem] = useState({});

  const handleClick = () => {
    const updatedItems = [...products, { name: newItem }];
    setProducts(updatedItems);
    setNewItem('');
  }

  const [productPrice, setProductPrice] = useState(0)
  const [subTotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  const handleQuantityChange = (value) => {
    const subTotal = value * productPrice;
    setSubtotal(subTotal)
  };

  const handlePriceChange = (value) => {
    const subTotal = value * productPrice;
    setSubtotal(subTotal)
  };

  const handleDiscountChange = (value) => {
    const totalDiscount = (value * subTotal) / 100;
    const total = subTotal - totalDiscount;
    setTotal(total)
  };

  return (
    <>
      {/* <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Field>
          <ModDropdown
            name="client"
            placeholder='Clientes...'
            search
            selection
            minCharacters={2}
            noResultsMessage="No se encontro cliente!"
            options={customers}
            onChange={(e, { name, value }) => {
              setValue(name, value);
            }}
          />
          <ModButtonProduct
            icon
            labelPosition='right'
            color="green"
            type="button"
            onClick={handleClick}
          >
            <Icon name="add" />Agregar producto</ModButtonProduct>
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
              {products.map(() => {
                return (
                  <Table.Row>
                    <Table.Cell >1</Table.Cell>
                    <Table.Cell  >
                      <Form.Dropdown
                        name="product.name"
                        placeholder='Productos...'
                        fluid
                        search
                        selection
                        minCharacters={2}
                        noResultsMessage="No se encontraron productos!"
                        options={productos}
                        onChange={(e) => {
                          setProductPrice(e.target.attributes.price?.value)
                        }}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Controller
                        name="product.price"
                        control={control}
                        render={({ field }) =>
                          <Form.Input
                            type="number"
                            fluid
                            transparent
                            onChange={(e) => {
                              field.onChange(e);
                              handlePriceChange(e.target.value);
                            }}
                            value={field.value}
                          >{`$ ${productPrice}`}</Form.Input>}
                      /></Table.Cell>
                    <Table.Cell>
                      <Controller
                        name="product.quantity"
                        control={control}
                        render={({ field }) =>
                          <Form.Input
                            min="0"
                            type="number"
                            fluid
                            onChange={(e) => {
                              field.onChange(e);
                              handleQuantityChange(e.target.value);
                            }}
                            value={field.value}
                          />}
                      /></Table.Cell>
                    <Table.Cell>
                      <Controller
                        name="product.subtotal"
                        control={control}
                        render={({ field }) => <Form.Input type="number" fluid transparent  {...field} >{`$ ${subTotal}`}</Form.Input>}
                      /></Table.Cell>
                    <Table.Cell>
                      <Controller
                        name="product.discount"
                        control={control}
                        render={({ field }) =>
                          <Form.Input
                            min="0"
                            type="number"
                            fluid
                            onChange={(e) => {
                              field.onChange(e);
                              handleDiscountChange(e.target.value);
                            }}
                            value={field.value}
                          />}
                      /></Table.Cell>
                    <Table.Cell>
                      <Controller
                        name="product.total"
                        control={control}
                        render={({ field }) => <Form.Input type="number" fluid transparent  {...field} >{`$ ${total}`}</Form.Input>}
                      /></Table.Cell>
                    <Table.Cell>
                      <Link href="/prueba">
                        <ButtonDelete color='red' size="tiny"></ButtonDelete>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                )
              })}

            </Table.Body>
          </Table>
        </Form.Field>
        <ModButtonBudget
          type="submit"
          icon
          labelPosition='right'
          color="green"
        >
          <Icon name="add" /> Crear presupuesto </ModButtonBudget>
      </Form> */}
      <Prueba />
    </>
  )
};

export default BudgetForm;

