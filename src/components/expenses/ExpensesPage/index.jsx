import { DropdownControlled, TextControlled } from '@/common/components/form';
import { Filters, Table } from '@/common/components/table';
import { ENTITIES, PAGES, SELECT_ALL_OPTION } from "@/common/constants";
import { createFilter } from '@/common/utils';
import { useFilters } from "@/hooks";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { EMPTY_FILTERS, EXPENSES_FILTERS_KEY, EXPENSES_STATE_OPTIONS, EXPENSE_STATES, HEADERS } from '../expenses.constants';

const ExpensesPage = ({ expenses = [], isLoading, onRefetch, onDownloadExcel }) => {

  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: EXPENSES_FILTERS_KEY });

  const onFilter = createFilter(filters, ['id', 'name', { field: "categories", nestedField: "name" }], {
    allState: SELECT_ALL_OPTION.value,
  });

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            entity={ENTITIES.EXPENSES}
          >
            <DropdownControlled
              width="200px"
              name="state"
              options={EXPENSES_STATE_OPTIONS}
              value={SELECT_ALL_OPTION.state}
              afterChange={onSubmit}
            />
            <TextControlled name="id" placeholder="Id" width="100px" />
            <TextControlled name="name" placeholder="Nombre" width="250px" />
            <TextControlled name="categories" placeholder="Categoria" width="150px" />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={HEADERS}
        page={PAGES.EXPENSES}
        elements={expenses}
        onFilter={onFilter}
        paginate
        filters={filters}
        setFilters={setFilters}
        onDownloadExcel={onDownloadExcel}
        color={EXPENSE_STATES[filters.state]?.color}
      />
    </>
  );
};

export default ExpensesPage;