import { DropdownControlled, TextControlled } from '@/common/components/form';
import { Filters, Table } from '@/common/components/table';
import { ENTITIES, PAGES, SELECT_ALL_OPTION } from "@/common/constants";
import { createFilter } from '@/common/utils';
import { useFilters } from "@/hooks";
import { FormProvider } from "react-hook-form";
import { Form, Label } from "semantic-ui-react";
import { EMPTY_FILTERS, EXPENSES_FILTERS_KEY, EXPENSES_STATE_OPTIONS, EXPENSE_STATES, HEADERS } from '../expenses.constants';
import { useGetSetting } from '@/api/settings';
import { Flex } from '@/common/components/custom';
import { useMemo } from 'react';

const ExpensesPage = ({ expenses = [], isLoading, onRefetch, onDownloadExcel }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: EXPENSES_FILTERS_KEY });

  const { data, isLoading: isLoadingSettings } = useGetSetting(ENTITIES.EXPENSE);

  const onFilter = createFilter(filters, ['id', 'name', { field: "categories", nestedField: "name" }, 'state'], ['state', 'categories']);

  const categoryOptions = useMemo(() => {
    return [SELECT_ALL_OPTION, ...(data?.categories?.map(({ name, color }) => ({
      key: name, text: (
        <Flex $alignItems="center" $justifyContent="space-between">
          {name} &nbsp; <Label color={color} circular empty />
        </Flex>
      ), value: name
    })) ?? [])];
  }, [data?.categories]);

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
            <DropdownControlled
              width="200px"
              name="categories"
              options={categoryOptions}
              value={SELECT_ALL_OPTION.state}
              afterChange={onSubmit}
              loading={isLoadingSettings}
            />
          </Filters>
        </Form>
      </FormProvider >
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