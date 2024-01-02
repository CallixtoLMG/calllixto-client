"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { FILTERS, HEADERS } from "../customers.common";
import { ButtonContainer } from "./styles";
import { Table } from '@/components/common/table';
import { ModalDelete } from '@/components/common/modals';
import { useCallback, useState } from "react";

const CustomersPage = ({ customers = [], onDelete }) => {
  const { push } = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteQuestion = useCallback((name) => `¿Está seguro que desea eliminar el cliente "${name}"?`, []);

  const mapCustomersForTable = useCallback((customer) => {
    return customer.map((customer, index) => ({ ...customer, key: index + 1 }));
  }, []);

  const actions = [
    {
      id: 1,
      icon: 'edit',
      color: 'blue',
      onClick: (customer) => { push(PAGES.CUSTOMERS.UPDATE(customer.id)) },
      tooltip: 'Editar'
    },
    {
      id: 2,
      icon: 'erase',
      color: 'red',
      onClick: (customer) => {
        setSelectedCustomer(customer);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ];

  const handleDelete = useCallback(async () => {
    setIsLoading(true);
    await onDelete(selectedCustomer.id);
    setIsLoading(false);
  }, [selectedCustomer, onDelete]);

  return (
    <>
      <ButtonContainer>
        <GoToButton
          color="green"
          text="Crear cliente"
          iconName="add"
          goTo={PAGES.CUSTOMERS.CREATE} />
      </ButtonContainer>
      <Table
        headers={HEADERS}
        elements={mapCustomersForTable(customers)}
        page={PAGES.CUSTOMERS}
        actions={actions}
        filters={FILTERS}
      />
      <ModalDelete
        showModal={showModal}
        setShowModal={setShowModal}
        title={deleteQuestion(selectedCustomer?.name)}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </>
  );
};

export default CustomersPage;
