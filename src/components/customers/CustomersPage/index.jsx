"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { HEADERS } from "../customers.common";
import { ButtonContainer } from "./styles";
import { Table } from '@/components/common/table';
import { useCallback } from "react";

const CustomersPage = ({ customers = [], onDelete }) => {
  const { push } = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el cliente "${name}"?`;

  const mapCustomersForTable = useCallback((c) => {
    return c.map((customer, index) => ({ ...customer, key: index + 1 }));
  }, []);

  return (
    <>
      <ButtonContainer>
        <GoToButton
          color="green"
          text="Crear cliente"
          iconName="add"
          goTo={PAGES.CUSTOMERS.CREATE} />
      </ButtonContainer>
      <Table headers={HEADERS} elements={mapCustomersForTable(customers)} page={PAGES.CUSTOMERS} />
    </>
  );
};

export default CustomersPage;
