"use client";
import { ModalDelete } from '@/components/common/modals';
import { Table } from '@/components/common/table';
import { PAGES } from "@/constants";
import { useCallback, useState } from "react";
import { FILTERS, HEADERS } from "../customers.common";

const CustomersPage = ({ customers = [], onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteQuestion = useCallback((name) => `¿Está seguro que desea eliminar el cliente "${name}"?`, []);

  const actions = [
    {
      id: 1,
      icon: 'delete',
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
      <Table
        headers={HEADERS}
        elements={customers.map((customer, index) => ({ ...customer, key: index + 1 }))}
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
