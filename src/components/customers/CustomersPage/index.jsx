import { DropdownControlled, TextControlled } from '@/common/components/form';
import { Filters, Table } from '@/common/components/table';
import { ENTITIES, PAGES } from "@/common/constants";
import { createFilter } from '@/common/utils';
import { useFilters } from "@/hooks";
import { FormProvider } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { CUSTOMERS_FILTERS_KEY, CUSTOMER_STATES_OPTIONS, EMPTY_FILTERS, HEADERS } from "../customers.constants";

const CustomersPage = ({ customers = [], isLoading, onRefetch }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: CUSTOMERS_FILTERS_KEY });

  const onFilter = createFilter(filters, ['name']);
  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            entity={ENTITIES.CUSTOMERS}
          >
            <DropdownControlled
              width="200px"
              name="state"
              options={CUSTOMER_STATES_OPTIONS}
              value={EMPTY_FILTERS.state}
              afterChange={onSubmit}
            />
            <TextControlled name="name" placeholder="Nombre" width="300px" />
          </Filters>
        </Form>
      </FormProvider >
      <Table
        isLoading={isLoading}
        headers={HEADERS}
        page={PAGES.CUSTOMERS}
        elements={customers}
        onFilter={onFilter}
        paginate
        filters={filters}
        setFilters={setFilters}
      />
    </>
  );
};

export default CustomersPage;
