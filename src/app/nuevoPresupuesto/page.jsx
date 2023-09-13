"use client"
import { useProducts } from "@/context/productContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Button,
  Dropdown,
  Form,
  Header,
  Icon
} from 'semantic-ui-react';
import { Label, MainContainer } from "./styles";



const NewBudget = ({ params }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
  });

  const { products, createProduct, updateProduct } = useProducts();
  const router = useRouter();

  const clientes = products.map((product) => {
    return (
      { key: product.id, value: product.name, text: product.name, }
    )
  })

  const countryOptions = [
    { key: 'af', value: 'af', flag: 'af', text: 'Afghanistan' },
    { key: 'ax', value: 'ax', flag: 'ax', text: 'Aland Islands' },
    { key: 'al', value: 'al', flag: 'al', text: 'Albania' },
    { key: 'dz', value: 'dz', flag: 'dz', text: 'Algeria' },
    { key: 'as', value: 'as', flag: 'as', text: 'American Samoa' },
    { key: 'ad', value: 'ad', flag: 'ad', text: 'Andorra' },
    { key: 'ao', value: 'ao', flag: 'ao', text: 'Angola' },
    { key: 'ai', value: 'ai', flag: 'ai', text: 'Anguilla' },
    { key: 'ag', value: 'ag', flag: 'ag', text: 'Antigua' },
    { key: 'ar', value: 'ar', flag: 'ar', text: 'Argentina' },
    { key: 'am', value: 'am', flag: 'am', text: 'Armenia' },
    { key: 'aw', value: 'aw', flag: 'aw', text: 'Aruba' },
    { key: 'au', value: 'au', flag: 'au', text: 'Australia' },
    { key: 'at', value: 'at', flag: 'at', text: 'Austria' },
    { key: 'az', value: 'az', flag: 'az', text: 'Azerbaijan' },
    { key: 'bs', value: 'bs', flag: 'bs', text: 'Bahamas' },
    { key: 'bh', value: 'bh', flag: 'bh', text: 'Bahrain' },
    { key: 'bd', value: 'bd', flag: 'bd', text: 'Bangladesh' },
    { key: 'bb', value: 'bb', flag: 'bb', text: 'Barbados' },
    { key: 'by', value: 'by', flag: 'by', text: 'Belarus' },
    { key: 'be', value: 'be', flag: 'be', text: 'Belgium' },
    { key: 'bz', value: 'bz', flag: 'bz', text: 'Belize' },
    { key: 'bj', value: 'bj', flag: 'bj', text: 'Benin' },
  ]

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value })
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (params.id) {
      updateProduct(Number(params.id), product)
      toast.success("Presupuesto modificado exitosamente",
        { duration: 4000 })
    } else {
      createProduct(product.name, product.stock, product.price)
      toast.success("Presupuesto creado exitosamente",
        { duration: 4000 })
    };
    router.push("/presupuestos")
  };

  useEffect(() => {
    if (params.id) {
      const productFound = products.find(product => product.id === Number(params.id))
      if (productFound)
        setProduct({
          name: productFound.name,
          stock: productFound.stock,
          price: productFound.price
        });
    };
  }, []);

  useEffect(() => {
    console.log((e) => e.target.value)
  }, [])


  return (
    <>
      <MainContainer>
        <Header as='h1'>Concepto del presupuesto</Header>
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <Dropdown
              placeholder='Elejir cliente'
              fluid
              search
              selection
              options={countryOptions}
              onChange={handleChange}
              noResultsMessage="No se encontraron clientes!.."
              name="name"
            />
            {/* <Label>Nombre del cliente</Label>
            <input onChange={handleChange} name="name" value={product.name} placeholder='Nombre del cliente...' /> */}
          </Form.Field>
          <Form.Field>
            <Label>Fecha de creacion</Label>
            <input type="date" onChange={handleChange} name="stock" value={product.stock} placeholder='Fecha de creacion...' />
          </Form.Field>
          <Form.Field>
            <Label>Precio</Label>
            <input onChange={handleChange} name="price" value={product.price} placeholder='Precio...' />
          </Form.Field>
          <Form.Field>
          </Form.Field>
          <Button
            type="submit"
            icon
            labelPosition='left'
            color={params.id ? "primary" : "green"}
          >
            <Icon name="add" /> {params.id ? "Modificar producto" : "Crear presupuesto"}
          </Button>
        </Form>
      </MainContainer>

    </>
  )
};

export default NewBudget;