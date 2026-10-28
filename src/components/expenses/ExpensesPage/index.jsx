import { useGetSetting } from '@/api/settings';
import { Flex } from '@/common/components/custom';
import { DropdownControlled, TextControlled } from '@/common/components/form';
import { Filters, Table } from '@/common/components/table';
import { CONTENT_SIZES, ENTITIES, PAGES, SELECT_ALL_OPTION } from "@/common/constants";
import { useListPageSideActions } from "@/components/layout";
import { useCallback, useMemo } from 'react';
import { FormProvider } from "react-hook-form";
import { Form, Label } from "semantic-ui-react";
import { EXPENSES_STATE_OPTIONS, EXPENSE_STATES, HEADERS, LIST_EXPENSES_QUERY_KEY } from '../expenses.constants';

const ExpensesPage = ({ expenses = [], isLoading, onRefetch, onDownloadExcel, sideActions = [], filterControls, serverPagination }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods
  } = filterControls;

  const { data, isLoading: isLoadingSettings } = useGetSetting(ENTITIES.EXPENSE);

  const { useSideActions, handleFilteredElementsChange } = useListPageSideActions({
    remote: true,
    sideActions,
    onRefetch,
    onDownloadExcel,
    entity: ENTITIES.EXPENSES,
    queryKey: LIST_EXPENSES_QUERY_KEY,
    pageName: PAGES.EXPENSES.NAME,
    updateTooltip: "Actualizar gastos",
    downloadTooltip: "Descargar gastos en Excel",
  });
  const handleFilteredExpensesChange = useCallback(handleFilteredElementsChange, [handleFilteredElementsChange]);

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
            remote
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            entity={ENTITIES.EXPENSES}
            showRefetchAction={!useSideActions}
          >
            <DropdownControlled
              minWidth="150px"
              width={CONTENT_SIZES.MIN}
              name="state"
              label="Estado"
              options={EXPENSES_STATE_OPTIONS}
              value={SELECT_ALL_OPTION.state}
            />
            <TextControlled
              name="id"
              label="Id"
              placeholder="A0004"
              width="8vw"
              minWidth="100px"
            />
            <TextControlled
              name="name"
              label="Nombre"
              placeholder="Netflix"
              width="20vw"
              minWidth="200px"
            />
            <DropdownControlled
              minWidth="150px"
              width={CONTENT_SIZES.MIN}
              maxWidth="300px"
              name="categories"
              label="Categorias"
              options={categoryOptions}
              value={SELECT_ALL_OPTION.state}
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
        serverPagination={serverPagination}
        paginate
        filters={filters}
        setFilters={setFilters}
        onDownloadExcel={useSideActions ? undefined : onDownloadExcel}
        onFilteredElementsChange={useSideActions ? handleFilteredExpensesChange : undefined}
        color={EXPENSE_STATES[filters.state]?.color}
        $ribbonOverflow
      />
    </>
  );
};

export default ExpensesPage;
