"use client"
import { useProducts } from '@/context/productContext';
import { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';

const EditForm = () => {

  const { products } = useProducts();

  const [product, setTask] = useState({
    name: "",
    description: "",
    category: "",
  });

  const handleChange = (e) => {
    setTask({ ...product, [e.target.name]: e.target.value })
  };

  const { updateProduct } = useProducts;
  const handleSubmit = () => {
    updateProduct(product.id, products)
  };

  useEffect

  return (
    <Form onSubmit={handleSubmit} >
      <Form.Field>
        <label>Nombre del producto</label>
        <input onChange={handleChange} placeholder={product.name} />
      </Form.Field>
      <Form.Field>
        <label>Cantidad en stock</label>
        <input onChange={handleChange} placeholder={product.stock} />
      </Form.Field>
      <Form.Field>
        <label>Categoria</label>
        <input onChange={handleChange} placeholder={product.category} />
      </Form.Field>
      <Button type='submit'>Modificar</Button>
    </Form >
  )
};

export default EditForm;