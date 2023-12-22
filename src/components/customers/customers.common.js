import { formatedPhone } from "@/utils";
import { Cell } from "@/components/common/Table";

export const HEADERS = [
  {
    title: "Nombre",
    value: "name",
    id: 1,
    value: (customer) => <Cell>{customer.name}</Cell>
  },
  {
    title: "Teléfono",
    value: "phone",
    id: 2,
    value: (customer) => <Cell>{formatedPhone(customer.phone.areaCode, customer.phone.number)}</Cell>
  },
  {
    title: "Email",
    value: "email",
    id: 3,
    value: (customer) => <Cell>{customer.email}</Cell>
  }
];