import { deleteCustomer } from '@/api/customers';
import { Input } from '@/components/common/custom';
import { ModalDelete } from '@/components/common/modals';
import { Filters, Table } from '@/components/common/table';
import { DEFAULT_PAGE_SIZE, PAGES } from "@/constants";
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from "react";
import { Controller, Form, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { HEADERS } from "../customers.common";
import { Pagination } from 'semantic-ui-react';

const EMPTY_FILTERS = { name: '' };

const CustomersPage = ({ customers = [], isLoading }) => {
  const methods = useForm();
  const { handleSubmit, control, reset } = methods;

  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      if (filters.name) {
        return customer.name.toLowerCase().includes(filters.name.toLowerCase());
      }
      return customer;
    })
  }, [customers, filters]);
  const pages = useMemo(() => Math.ceil(filteredCustomers.length / DEFAULT_PAGE_SIZE), [filteredCustomers]);
  const currentPageCustomers = useMemo(() => {
    const startIndex = (activePage - 1) * DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + DEFAULT_PAGE_SIZE;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [activePage, filteredCustomers]);

  const onFilter = (data) => {
    setActivePage(1);
    setFilters(data);
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
      </FormProvider>
      <Pagination
        activePage={activePage}
        onPageChange={(e, { activePage }) => setActivePage(activePage)}
        siblingRange={2}
        boundaryRange={2}
        firstItem={null}
        lastItem={null}
        pointing
        secondary
        totalPages={pages}
      />
      <Table
        isLoading={isLoading}
        headers={HEADERS}
        elements={currentPageCustomers}
        page={PAGES.CUSTOMERS}
        actions={actions}
      />
      <ModalDelete
        showModal={showModal}
        setShowModal={setShowModal}
        title={`¿Está seguro que desea eliminar el cliente "${selectedCustomer?.name}"?`}
        onDelete={mutate}
        isLoading={isPending}
      />
    </>
  );
};

export default CustomersPage;
