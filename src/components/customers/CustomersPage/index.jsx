import { DropdownControlled, TextControlled } from '@/common/components/form';
import { Filters, Table } from '@/common/components/table';
import { CONTENT_SIZES, ENTITIES, FIELD_LABELS, PAGES } from "@/common/constants";
import { createFilter } from '@/common/utils';
import { useListPageSideActions } from "@/components/layout";
import { useFilters } from "@/hooks";
import { useCallback, useMemo } from "react";
import { FormProvider } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { CUSTOMERS_FILTERS_KEY, CUSTOMER_STATES_OPTIONS, EMPTY_FILTERS, HEADERS, LIST_CUSTOMERS_QUERY_KEY } from "../customers.constants";

const CustomersPage = ({ customers = [], isLoading, onRefetch, onDownloadExcel, sideActions = [] }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: CUSTOMERS_FILTERS_KEY });

  const onFilter = useMemo(() => createFilter(filters, { name: {}, state: { fullMatch: true } }), [filters]);
  const { useSideActions, handleFilteredElementsChange } = useListPageSideActions({
    sideActions,
    onRefetch,
    onDownloadExcel,
    entity: ENTITIES.CUSTOMERS,
    queryKey: LIST_CUSTOMERS_QUERY_KEY,
    pageName: PAGES.CUSTOMERS.NAME,
    updateTooltip: "Actualizar clientes",
    downloadTooltip: "Descargar clientes en Excel",
  });
  const handleFilteredCustomersChange = useCallback(handleFilteredElementsChange, [handleFilteredElementsChange]);

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit} key={JSON.stringify(filters)}>
          <Filters
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            appliedCount={appliedCount}
            hydrated={hydrated}
            entity={ENTITIES.CUSTOMERS}
            showRefetchAction={!useSideActions}
          >
            <DropdownControlled
              minWidth="150px"
              width={CONTENT_SIZES.MIN}
              name="state"
              label={FIELD_LABELS.STATE}
              options={CUSTOMER_STATES_OPTIONS}
              value={EMPTY_FILTERS.state}
              afterChange={onSubmit}
            />
            <TextControlled
              name="name"
              label={FIELD_LABELS.NAME}
              placeholder="Martín Bueno"
              width="20vw"
              minWidth="200px"
            />
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
        onDownloadExcel={useSideActions ? undefined : onDownloadExcel}
        onFilteredElementsChange={useSideActions ? handleFilteredCustomersChange : undefined}
      />
    </>
  );
};

export default CustomersPage;
