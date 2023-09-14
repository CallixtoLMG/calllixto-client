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

  const clients = [
    { key: '1', value: 'mi', text: 'Milton' },
    { key: '2', value: 'le', text: 'Levi' },
    { key: '3', value: 'ga', text: 'Gawa' },
    { key: '4', value: 'ma', text: 'Marcelo' },
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

  const handleSelect = (e) => {
    e.target.value
  }

  return (
    <>
      <MainContainer>
        <Header as='h1'>Concepto del presupuesto</Header>
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <Label>Cliente</Label>
            <Dropdown placeholder='Elejir cliente'
              search
              selection
              options={clients}
              onChange={handleChange}
              noResultsMessage="No se encontraron clientes!.."
              name="name">
            </Dropdown>
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

//Crear una constante donde este figure el nombre de los productos, y el precio, el stock en lo posible,
//como el search que ya tengo, y que esos datos se muestren en el search, OnClick, se tendria que pushaer
//el nuevo item a la tabla, pero como estoy usando un state para guardarlo mejor hacerlo con setState?
//Ver en el search cuales son los values que guarda,
//HAcer un mapeo en la tabla por el cual, por cada producto se agrege un compoente y asi populo la tabla
// una constantae que guarde todos los precios en valor de numero, los sume... y esa constante es la que te
// tengo qeu pushear en el valor monto total...
// APARTE DE ESO se tiene que crear un objeto presupuesto con todos los prodcutos dentro, fecha y cliente...
// Seria algo asi:

// presupuesto = {
//   cliente: "juan",
//   fecha_inicio: "20/04/2020 8:35 pm",
//   fecha_fin: "26/07/2020 9pm",
//   productos: [
//     { nombre: "producto1", precio: 1, stock: 2 },
//     { nombre: "producto2", precio: 2, stock: 2 }]
// }