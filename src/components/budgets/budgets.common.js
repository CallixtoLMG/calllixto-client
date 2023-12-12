const HEADERS = [
  {
    name: "",
    value: "id",
  },
  {
    name: "Cliente",
    object: "customer",
    value: "name",
  },
  {
    name: "Fecha",
    date: true,
    value: "createdAt",
  },
];

const PRODUCTSHEADERS = [
  {
    name: "Descripción",
    value: "name",
    id: 1
  },
  {
    name: "Cantidad",
    value: "quantity",
    id: 2
  },
  {
    name: "Precio Unitario",
    value: "price",
    modPrice: true,
    id: 3
  },
  {
    name: "Descuento",
    value: "discount",
    id: 4
  },
  {
    name: "Importe",
    value: "total",
    modPrice: true,
    id: 5
  }
];

const SHOWPRODUCTSHEADERS = [
  { name: "Nombre", value: "name", id: 1 },
  { name: "Precio", value: "price", id: 2 },
  { name: "Cantidad", value: "quantity", id: 3 },
  { name: "Subtotal", value: "subtotal", id: 4 },
  { name: "Descuento en %", value: "discount", id: 5 },
  { name: "Total", value: "total", id: 6 },
  { name: "Acciones", value: "actions", id: 7 },
];

export {
  HEADERS, PRODUCTSHEADERS, SHOWPRODUCTSHEADERS
};

