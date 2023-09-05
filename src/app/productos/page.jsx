import TableOfProducts from "@/components/TableOfProducts";
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

async function loadUser() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const data = await res.json()
  return data
};

async function Products() {
  const users = await loadUser()

  return (
    <TableOfProducts users={users} headerNames={headerCell} />
  )
};

export default Products;