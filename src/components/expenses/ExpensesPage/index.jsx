import { useGetSetting } from '@/api/settings';
import { Flex } from '@/common/components/custom';
import { DropdownControlled, TextControlled } from '@/common/components/form';
import { Filters, Table } from '@/common/components/table';
import { ENTITIES, PAGES, SELECT_ALL_OPTION } from "@/common/constants";
import { createFilter } from '@/common/utils';
import { useFilters } from "@/hooks";
import { useMemo } from 'react';
import { FormProvider } from "react-hook-form";
import { Form, Label } from "semantic-ui-react";
import { EMPTY_FILTERS, EXPENSES_FILTERS_KEY, EXPENSES_STATE_OPTIONS, EXPENSE_STATES, HEADERS } from '../expenses.constants';

const ExpensesPage = ({ expenses = [], isLoading, onRefetch, onDownloadExcel }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: EXPENSES_FILTERS_KEY });

  const { data, isLoading: isLoadingSettings } = useGetSetting(ENTITIES.EXPENSE);

  const onFilter = createFilter(filters, {
    id: {},
    name: {},
    categories: { skipAll: true, arrayKey: 'name', fullMatch: true },
    state: { skipAll: true, fullMatch: true }
  });

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
              label="Estado"
              options={EXPENSES_STATE_OPTIONS}
              value={SELECT_ALL_OPTION.state}
              afterChange={onSubmit}
            />
            <TextControlled name="id" label="Id" placeholder="A0004" width="100px" />
            <TextControlled name="name" label="Nombre" placeholder="Netflix" width="250px" />
            <DropdownControlled
              width="200px"
              name="categories"
              label="Categorias"
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