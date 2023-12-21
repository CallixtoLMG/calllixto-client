"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { HEADERS } from "../customers.common";
import { ButtonContainer } from "./styles";
import Table from '@/components/Table';
import { useCallback } from "react";

const CustomersPage = ({ customers = [], onDelete }) => {
  const { push } = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el cliente "${name}"?`;

  const mapCustomersForTable = useCallback((c) => {
    console.log({ c })
    return c.map((customer, index) => ({ ...customer, key: index + 1 }));
  }, []);

  console.log({ customers });

  return (
    <>
      <ButtonContainer>
        <ButtonGoTo
          color="green"
          text="Crear cliente"
          iconName="add"
          goTo={PAGES.CUSTOMERS.CREATE} />
      </ButtonContainer>
      <Table headers={HEADERS} elements={mapCustomersForTable(customers)} />
    </>
  );
};

export default CustomersPage;
