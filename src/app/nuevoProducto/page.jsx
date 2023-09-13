"use client"
import { useProducts } from "@/context/productContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button, Form, Icon } from 'semantic-ui-react';
import { Label, MainContainer } from "./styles";

const NewProduct = ({ params }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
  });

  const { products, createProduct, updateProduct } = useProducts();
  const router = useRouter();

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value })
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (params.id) {
      updateProduct(Number(params.id), product)
      toast.success("Producto modificado exitosamente",
        { duration: 4000 })
    } else {
      createProduct(product.name, product.stock, product.price)
      toast.success("Producto creado exitosamente",
        { duration: 4000 })
    };
    router.push("/productos")
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

  return (
    <>
      <MainContainer>
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <Label>Nombre del producto</Label>
            <input onChange={handleChange} name="name" value={product.name} placeholder='Nombre del producto...' />
          </Form.Field>
          <Form.Field>
            <Label>En stock</Label>
            <input onChange={handleChange} name="stock" value={product.stock} placeholder='En stock...' />
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
            <Icon name="add" /> {params.id ? "Modificar producto" : "Crear producto"}
          </Button>
        </Form>
      </MainContainer>
    </>
  )
};

export default NewProduct;