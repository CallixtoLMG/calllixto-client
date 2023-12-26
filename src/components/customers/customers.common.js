import { Cell } from "@/components/common/table";
import { formatedPhone } from "@/utils";

export const HEADERS = [
  {
    id: 1,
    value: (customer) => <Cell width={1}>{customer.key}</Cell>
  },
  {
    id: 2,
    title: "Nombre",
    value: (customer) => <Cell align="left">{customer.name}</Cell>
  },
  {
    id: 3,
    title: "Teléfono",
    value: (customer) => <Cell width={3}>{formatedPhone(customer.phone.areaCode, customer.phone.number)}</Cell>
  },
  {
    id: 4,
    title: "Email",
    value: (customer) => <Cell width={4}>{customer.email}</Cell>
  }
];