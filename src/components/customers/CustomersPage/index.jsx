"use client";
import { LIST_CUSTOMERS_QUERY_KEY, deleteCustomer } from '@/api/customers';
import { ModalDelete } from '@/components/common/modals';
import { Table } from '@/components/common/table';
import { usePaginationContext } from "@/components/common/table/Pagination";
import { PAGES } from "@/constants";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from "react";
import { toast } from 'react-hot-toast';
import { FILTERS, HEADERS } from "../customers.common";

const CustomersPage = ({ customers = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const queryClient = useQueryClient();
  const { setFilters } = usePaginationContext();

  const deleteQuestion = useCallback((name) => `¿Está seguro que desea eliminar el cliente "${name}"?`, []);

  const onFilter = (data) => {
    if (data.id) {
      setFilters({ ...data, id: data.id });
      return;
    }
  };

  const actions = [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (customer) => {
        setSelectedCustomer(customer);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await deleteCustomer(selectedCustomer?.id);
      return data
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_CUSTOMERS_QUERY_KEY] });
        toast.success('Cliente eliminado!');
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  return (
    <>
      <Table
        headers={HEADERS}
        elements={customers.map((customer, index) => ({ ...customer, key: index + 1 }))}
        page={PAGES.CUSTOMERS}
        actions={actions}
        filters={FILTERS}
        onFilter={onFilter}
      />
      <ModalDelete
        showModal={showModal}
        setShowModal={setShowModal}
        title={deleteQuestion(selectedCustomer?.name)}
        onDelete={mutate}
        isLoading={isPending}
      />
    </>
  );
};

export default CustomersPage;
