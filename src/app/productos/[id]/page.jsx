"use client"
import ShowProduct from "@/components/ShowProduct";

const headerCell = [
  {
    name: "Codigo",
    id: 1
  },
  {
    name: "Nombre del producto",
    id: 2
  }, {
    name: "Stock",
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

async function getProduct(id) {
  const res = await fetch(`https://dummyjson.com/products/${id}`);
  const data = await res.json();
  return data;
};

async function Producto({ params }) {
  const product = await getProduct(params.id)
  return (
    <ShowProduct headerNames={headerCell} product={product} />
  )
}

export default Producto;