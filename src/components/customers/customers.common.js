import { formatedPhone } from "@/utils";
import { Cell } from "../Table/styles";

export const HEADERS = [
  {
    name: "Nombre",
    value: "name",
    id: 1,
    value: (customer) => <Cell>{customer.name}</Cell>
  },
  {
    name: "Teléfono",
    value: "phone",
    id: 2,
    value: (customer) => <Cell>{formatedPhone(customer.phone.areaCode, customer.phone.number)}</Cell>
  },
  {
    name: "Email",
    value: "email",
    id: 3,
    value: (customer) => <Cell>{customer.email}</Cell>
  }
];