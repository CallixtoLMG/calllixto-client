import { Dropdown, Flex, Input } from '@/components/common/custom';
import { Filters, Table } from '@/components/common/table';
import { CUSTOMER_STATES, PAGES } from "@/constants";
import { useCallback, useState } from "react";
import { Controller, useForm } from 'react-hook-form';
import { Form, Label } from 'semantic-ui-react';
import { HEADERS } from "../customers.common";

const EMPTY_FILTERS = { name: '', state: CUSTOMER_STATES.ACTIVE.id };
const STATE_OPTIONS = [
  ...Object.entries(CUSTOMER_STATES).map(([key, value]) => ({
    key,
    text: (
      <Flex alignItems="center" justifyContent="space-between">
        {value.title}&nbsp;<Label color={value.color} circular empty />
      </Flex>
    ),
    value: key
  }))
];

const CustomersPage = ({ customers = [], isLoading }) => {
  const { handleSubmit, control, reset } = useForm();
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const onFilter = useCallback(customer => {

    if (filters.name && !customer.name?.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    if (filters.state && filters.state !== customer.state) {
      return false;
    }
    return true;
  }, [filters]);

  const onRestoreFilters = () => {
    reset(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  }

  return (
    <>
      <Form onSubmit={handleSubmit(setFilters)}>
        <Filters onRestoreFilters={onRestoreFilters}>
          <Controller
            name="state"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <Dropdown
                {...rest}
                $maxWidth
                top="10px"
                height="35px"
                minHeight="35px"
                selection
                options={STATE_OPTIONS}
                defaultValue={STATE_OPTIONS[0].key}
                onChange={(e, { value }) => {
                  onChange(value);
                  setFilters({ ...filters, state: value });
                }}
              />
            )}
          />
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
        onFilter={onFilter}
        paginate
      />
    </>
  );
};

export default CustomersPage;
