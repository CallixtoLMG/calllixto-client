"use client"
import ProductsPage from "@/components/products/ProductsPage";

const Products = () => {
  const products = [
    {
      code: 1,
      name: "Madera",
      price: 150
    },
    {
      code: 2,
      name: "Piedra",
      price: 250
    },
    {
      code: 3,
      name: "Ripio",
      price: 450
    }
  ];

  return (
    <ProductsPage products={products} />
  )
};

export default Products;