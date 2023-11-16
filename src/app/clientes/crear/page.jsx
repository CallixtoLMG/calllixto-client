"use client"
import { create } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";

const CreateCustomer = () => {
 
  return (
    <CustomerForm onSubmit={create} />
  )
};

export default CreateCustomer;