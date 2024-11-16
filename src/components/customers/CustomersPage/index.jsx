import { Dropdown, Flex, Input } from '@/components/common/custom';
import { Filters, Table } from '@/components/common/table';
import { CUSTOMER_STATES, PAGES } from "@/constants";
import { useFilters } from '@/hooks/useFilters';
import { createFilter } from '@/utils';
import { Controller } from 'react-hook-form';
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

const CustomersPage = ({ customers = [], isLoading, onRefetch }) => {
  const {
    control,
    hasUnsavedFilters,
    onRestoreFilters,
    onSubmit,
    onStateChange,
    appliedFilters,
  } = useFilters(EMPTY_FILTERS, ['name']);

  const onFilter = createFilter(appliedFilters, ['name']);

  return (
    <>
      <Form onSubmit={onSubmit(() => { })}>
        <Filters
          onRefetch={onRefetch}
          onRestoreFilters={onRestoreFilters}
          hasUnsavedFilters={hasUnsavedFilters()}
        >
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
                defaultValue={EMPTY_FILTERS.state}
                onChange={(e, { value }) => {
                  onChange(value);
                  onStateChange(value);
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
