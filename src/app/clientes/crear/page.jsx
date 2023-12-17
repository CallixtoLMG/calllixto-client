"use client"
import { create } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CreateCustomer = () => {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
  }, [router]);
  return (
    <CustomerForm onSubmit={create} />
  )
};

export default CreateCustomer;