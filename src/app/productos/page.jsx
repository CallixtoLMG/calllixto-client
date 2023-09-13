"use client"
import TableOfProducts from "@/components/TableOfProducts";
import { useProducts } from "@/context/productContext";

const headerCell = [
  {
    name: "Codigo",
    id: 1
  },
  {
    name: "Nombre del producto",
    id: 2
  },
  {
    name: "Cantidad en stock",
    id: 3
  },
  {
    name: "Precio",
    id: 4
  },
  {
    name: "Acciones",
    id: 5
  },
];

const Products = () => {
  const { products } = useProducts();

  return (
    <TableOfProducts products={products} headerNames={headerCell} />
  )
};

export default Products;