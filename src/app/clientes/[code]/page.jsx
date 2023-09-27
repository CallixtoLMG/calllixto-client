"use client";
import ShowCustomer from "@/components/customers/ShowCustomer";

const customers = [
  { code: '1', name: 'Milton', tel: "4240288", mail: "Milton@hotmail.com" },
  { code: '2', name: 'Levi', tel: "4268972", mail: "Levi@yahoo.com" },
  { code: '3', name: 'Gawain', tel: "4369852", mail: "Gawain@gmail.com" },
  { code: '4', name: 'Marcelo', tel: "4345872", mail: "Marcelo@baduu.com" },
];

const Customer = ({ params }) => {

  return (
    <ShowCustomer customer={customers[params.code]} />
  )
};

export default Customer;