import { useProducts } from "@/context/productContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form } from 'semantic-ui-react';

const AddForm = () => {

  const { createProduct } = useProducts();
  const [product, setTask] = useState({
    name: "",
    description:"",
    category: "",
  });
  const router = useRouter();

  const handleChange = (e) => {
    setTask({ ...product, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    createProduct(product.name, product.stock, product.category)
    router.push("/productos")
  };

  return (

    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Nombre del producto</label>
        <input  onChange={handleChange} name="name" placeholder="..." />
      </Form.Field>
      <Form.Field>
        <label>Cantidad en stock</label>
        <input  onChange={handleChange} name="stock" placeholder="..." />
      </Form.Field>
      <Form.Field>
        <label>Categoria</label>
        <input  onChange={handleChange} name="category" placeholder="..." />
      </Form.Field>
      <Button type='submit'>Agregar</Button>
    </Form>
  )
};

export default AddForm;