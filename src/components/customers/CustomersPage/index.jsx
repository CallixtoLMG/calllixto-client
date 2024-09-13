import { deleteCustomer, LIST_CUSTOMERS_QUERY_KEY } from '@/api/customers';
import { Input } from '@/components/common/custom';
import { ModalAction } from '@/components/common/modals';
import { Filters, Table } from '@/components/common/table';
import { COLORS, ICONS, PAGES } from "@/constants";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from "react";
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Form } from 'semantic-ui-react';
import { HEADERS } from "../customers.common";

const EMPTY_FILTERS = { name: '' };

const CustomersPage = ({ customers = [], isLoading }) => {
  const { handleSubmit, control, reset } = useForm();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const onFilter = useCallback(customer => {
    if (filters.name) {
      return customer.name.toLowerCase().includes(filters.name.toLowerCase());
    }
    return customer;
  }, [filters]);

  const actions = [
    {
      id: 1,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (customer) => {
        setSelectedCustomer(customer);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await deleteCustomer(selectedCustomer?.id);
      return response
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Cliente eliminado!');
        queryClient.invalidateQueries({ queryKey: [LIST_CUSTOMERS_QUERY_KEY], refetchType: 'all' });
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  const onRestoreFilters = () => {
    reset(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  }

  return (
    <>
      <Form onSubmit={handleSubmit(setFilters)}>
        <Filters onRestoreFilters={onRestoreFilters}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                $maxWidth
                $marginBottom
                height="35px"
                placeholder="Nombre"
              />
            )}
          />
        </Filters>
      </Form>
      <Table
        isLoading={isLoading}
        headers={HEADERS}
        page={PAGES.CUSTOMERS}
        elements={customers}
        actions={actions}
        onFilter={onFilter}
        paginate
      />
      <ModalAction
        showModal={showModal}
        setShowModal={setShowModal}
        title={`¿Está seguro que desea eliminar el cliente "${selectedCustomer?.name}"?`}
        onConfirm={mutate}
        isLoading={isPending}
        confirmButtonIcon={ICONS.TRASH}
      />
    </>
  );
};

export default CustomersPage;
