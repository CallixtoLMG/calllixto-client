"use client";
import ShowProduct from "@/components/products/ShowProduct";

const Producto = ({ params }) => {
  const product = {
    code: params.code,
    name: "Maderita",
    price: 150
  };

  return (
    <ShowProduct product={product} />
  )
};

export default Producto;