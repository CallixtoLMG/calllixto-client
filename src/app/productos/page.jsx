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
  }, {
    name: "Cantidad en stock",
    id: 3
  },
  {
    name: "Categoria",
    id: 4
  },
  {
    name: "Acciones",
    id: 5
  },
];

async function loadProducts() {
  const res = await fetch("https://dummyjson.com/products");
  const data = await res.json()
  return data
};

async function Products() {
  const values = useProducts()
  console.log(values)
  const products = await loadProducts()

  return (
    <TableOfProducts products={products.products} headerNames={headerCell} />
  )
};

export default Products;