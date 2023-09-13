"use client"
import Budget from "@/components/Budget";
import { useProducts } from "@/context/productContext";

const headerCell = [
  {
    name: "Codigo",
    id: 1
  },
  {
    name: "Cliente",
    id: 2
  },
  {
    name: "Fecha de creacion",
    id: 3
  },
  {
    name: "Monto total",
    id: 4
  },
];

function Presupuesto() {
  const { products } = useProducts()

  return (
    <Budget products={products} headerNames={headerCell} />
  )
};

export default Presupuesto;