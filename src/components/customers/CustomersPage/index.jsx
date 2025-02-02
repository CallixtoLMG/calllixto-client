import { DropdownControlled, TextControlled } from '@/common/components/form';
import { Filters, Table } from '@/common/components/table';
import { PAGES } from "@/common/constants";
import { createFilter } from '@/common/utils';
import { useFilters } from '@/hooks/useFilters';
import { FormProvider } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { CUSTOMER_STATES_OPTIONS, EMPTY_FILTERS, HEADERS } from "../customers.constants";

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
