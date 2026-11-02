import { DropdownControlled, DropdownField, TextControlled } from '@/common/components/form';
import { Filters, Table } from '@/common/components/table';
import { CONTENT_SIZES, PAGES, SORTING } from "@/common/constants";
import { useListPageSideActions } from "@/components/layout";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { EXPENSES_STATE_OPTIONS, EXPENSE_STATES, EXPENSE_SORT_FIELDS, HEADERS } from '../expenses.constants';

const ExpensesPage = ({ expenses = [], isLoading, list, total, sideActions = [] }) => {
  const { onRestoreFilters, onSubmit, methods, appliedCount, hydrated } = list;
  useListPageSideActions({ sideActions });

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            onRestoreFilters={onRestoreFilters} appliedCount={appliedCount}
            hydrated={hydrated} showRefetchAction={false}
          >
            <DropdownControlled
              minWidth="150px" width={CONTENT_SIZES.MIN} name="state" label="Estado"
              options={EXPENSES_STATE_OPTIONS} clearable
            />
            <TextControlled name="id" label="Id" placeholder="A0004" width="8vw" minWidth="100px" />
            <TextControlled name="name" label="Nombre" placeholder="Netflix" width="20vw" minWidth="200px" />
            <DropdownField
              label="Categorias (no disponible)" placeholder="No disponible" width="180px"
              options={[]} value="" disabled selection dataTestId="dropdown-categories"
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading} headers={HEADERS} page={PAGES.EXPENSES} elements={expenses}
        paginate color={EXPENSE_STATES[list.appliedFilters.state]?.color} $ribbonOverflow
        serverPagination={{
          hydrated, pageNumber: list.pageNumber, pageSize: list.pageSize, total,
          sorting: {
            key: Object.keys(EXPENSE_SORT_FIELDS).find((key) => EXPENSE_SORT_FIELDS[key] === list.sort),
            direction: list.order === "desc" ? SORTING.DESC : SORTING.ASC,
          },
          sortFields: EXPENSE_SORT_FIELDS,
          onPageChange: list.setPageNumber, onPageSizeChange: list.setPageSize, onSortChange: list.setSorting,
        }}
      />
    </>
  );
};

export default ExpensesPage;
