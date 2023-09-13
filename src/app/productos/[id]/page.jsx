"use client"
import ShowProduct from "@/components/ShowProduct";
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
    name: "Stock",
    id: 3
  },
  {
    name: "Precio",
    id: 4
  },
];
const Producto = ({ params }) => {
  const { products } = useProducts()

  return (
    <ShowProduct headerNames={headerCell} product={products[params.id-1]} />
  )
};

export default Producto;