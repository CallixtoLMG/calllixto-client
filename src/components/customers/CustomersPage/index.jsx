import { LIST_CUSTOMERS_QUERY_KEY, deleteCustomer } from '@/api/customers';
import { Input } from '@/components/common/custom';
import { ModalDelete } from '@/components/common/modals';
import { Filters, Table } from '@/components/common/table';
import { usePaginationContext } from "@/components/common/table/Pagination";
import { PAGES } from "@/constants";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from "react";
import { Controller, Form, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { HEADERS } from "../customers.common";

const EMPTY_FILTERS = { id: '' };

const CustomersPage = ({ customers = [], isLoading }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const queryClient = useQueryClient();
  const { resetFilters } = usePaginationContext();
  const methods = useForm();
  const { handleSubmit, control, reset } = methods;

  const deleteQuestion = useCallback((name) => `¿Está seguro que desea eliminar el cliente "${name}"?`, []);

  const onFilter = (data) => {
    const filters = { ...data };
    if (data.name) {
      filters.sort = "name";
    };
    resetFilters(filters);
  }

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

  const onRestoreFilters = () => {
    reset(EMPTY_FILTERS);
    onFilter(EMPTY_FILTERS);
  }

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onFilter)}>
          <Filters onRestoreFilters={onRestoreFilters}>
            <Controller
              name="id"
              control={control}
              render={({ field }) => (
                <Input
                  maxWidth
                  {...field}
                  $marginBottom
                  height="35px"
                  placeholder="Nombre"
                />
              )}
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={HEADERS}
        elements={customers.map((customer, index) => ({ ...customer, key: index + 1 }))}
        page={PAGES.CUSTOMERS}
        actions={actions}
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
