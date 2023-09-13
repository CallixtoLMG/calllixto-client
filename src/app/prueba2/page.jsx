import Budget from "@/components/Budget";

const headerCell = [
  {
    name: "Codigo",
    id: 1
  },
  {
    name: "Nombre del producto",
    id: 2
  }, {
    name: "Cantidad",
    id: 3
  },
  {
    name: "Precio",
    id: 4
  },
  {
    name: "Descuento",
    id: 5
  },
  {
    name: "Precio total",
    id: 6
  },
  {
    name: "Acciones",
    id: 6
  },
];

async function loadProducts() {
  const res = await fetch("https://dummyjson.com/products");
  const data = await res.json()
  return data
};

async function Presupuesto() {
  const products = await loadProducts();
  return (
    <Budget products={products.products} headerNames={headerCell}  />
  )
};

export default Presupuesto;