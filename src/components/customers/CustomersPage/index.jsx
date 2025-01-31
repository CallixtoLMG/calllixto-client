import { Filters, Table } from '@/components/common/table';
import { PAGES } from "@/common/constants";
import { useFilters } from '@/hooks/useFilters';
import { createFilter } from '@/common/utils';
import { FormProvider } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { CUSTOMER_STATES_OPTIONS, EMPTY_FILTERS, HEADERS } from "../customers.constants";
import { DropdownControlled, TextControlled } from '@/components/common/form';

const CustomersPage = ({ customers = [], isLoading, onRefetch }) => {
  const {
    onRestoreFilters,
    onSubmit,
    appliedFilters,
    methods
  } = useFilters(EMPTY_FILTERS);

  const onFilter = createFilter(appliedFilters, ['name']);

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit(() => {})}>
          <Filters
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
          >
            <DropdownControlled
              width="200px"
              name="state"
              options={CUSTOMER_STATES_OPTIONS}
              defaultValue={EMPTY_FILTERS.state}
              afterChange={() => {
                onSubmit(() => {})();
              }}
            />
            <TextControlled name="name" placeholder="Nombre" width="300px" />
          </Filters>
        </Form>
      </FormProvider>
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
