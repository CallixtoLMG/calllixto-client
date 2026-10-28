import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { CONTENT_SIZES, ENTITIES, FIELD_LABELS, PAGES } from "@/common/constants";
import { useListPageSideActions } from "@/components/layout";
import { useCallback, useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { EMPTY_FILTERS, LIST_SUPPLIERS_QUERY_KEY, SUPPLIERS_COLUMNS, SUPPLIER_STATES_OPTIONS } from "../suppliers.constants";

const SuppliersPage = ({ isLoading, suppliers = [], onRefetch, onDownloadExcel, sideActions = [], filterControls, serverPagination }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = filterControls;

  const { useSideActions, handleFilteredElementsChange } = useListPageSideActions({
    remote: true,
    sideActions,
    onRefetch,
    onDownloadExcel,
    entity: ENTITIES.SUPPLIERS,
    queryKey: LIST_SUPPLIERS_QUERY_KEY,
    pageName: PAGES.SUPPLIERS.NAME,
    updateTooltip: "Actualizar proveedores",
    downloadTooltip: "Descargar proveedores en Excel",
    showUpdateTooltipWhenExpanded: true,
  });
  const handleFilteredSuppliersChange = useCallback(handleFilteredElementsChange, [handleFilteredElementsChange]);

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            remote
            entity={ENTITIES.SUPPLIERS}
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            appliedCount={appliedCount}
            hydrated={hydrated}
            showRefetchAction={!useSideActions}
          >
            <DropdownControlled
              minWidth="150px"
              width={CONTENT_SIZES.MIN}
              name="state"
              label={FIELD_LABELS.STATE}
              options={SUPPLIER_STATES_OPTIONS}
              defaultValue={EMPTY_FILTERS.state}
            />
            <TextControlled
              name="id"
              label={FIELD_LABELS.ID}
              placeholder="SE"
              width="8vw"
              minWidth="80px"
            />
            <TextControlled
              name="name"
              label={FIELD_LABELS.NAME}
              placeholder="Suministro Estrella"
              width="20vw"
              minWidth="200px"
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={SUPPLIERS_COLUMNS}
        elements={suppliers}
        page={PAGES.SUPPLIERS}
        serverPagination={serverPagination}
        paginate
        filters={filters}
        setFilters={setFilters}
        onDownloadExcel={useSideActions ? undefined : onDownloadExcel}
        onFilteredElementsChange={useSideActions ? handleFilteredSuppliersChange : undefined}
      />
    </>
  );
};

export default SuppliersPage;
