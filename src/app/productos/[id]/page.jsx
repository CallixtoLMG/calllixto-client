"use client"
import ShowProduct from "@/components/ShowProduct";

const headerCell = [
  {
    name: "Codigo",
    id: 1
  },
  {
    name: "Nombre Completo",
    id: 2
  }, {
    name: "Mail",
    id: 3
  },
  {
    name: "Telefono",
    id: 4
  },
  {
    name: "Acciones",
    id: 5
  },
];

async function getUser(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  const data = await res.json();
  return data;
};

async function Producto({ params }) {
  const user = await getUser(params.id)
  return (
    <ShowProduct headerNames={headerCell} user={user} />
  )
}

export default Producto;