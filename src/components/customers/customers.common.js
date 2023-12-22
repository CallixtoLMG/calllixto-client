import { formatedPhone } from "@/utils";
import { Cell } from "@/components/common/table";

export const HEADERS = [
  {
    id: 1,
    value: (customer) => <Cell>{customer.key}</Cell>
  },
  {
    id: 2,
    title: "Nombre",
    value: (customer) => <Cell>{customer.name}</Cell>
  },
  {
    id: 3,
    title: "Teléfono",
    value: (customer) => <Cell>{formatedPhone(customer.phone.areaCode, customer.phone.number)}</Cell>
  },
  {
    id: 4,
    title: "Email",
    value: (customer) => <Cell>{customer.email}</Cell>
  }
];