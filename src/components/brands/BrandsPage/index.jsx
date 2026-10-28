import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { CONTENT_SIZES, ENTITIES, FIELD_LABELS, PAGES } from "@/common/constants";
import { useListPageSideActions } from "@/components/layout";
import { useCallback, useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { BRAND_COLUMNS, BRAND_STATES_OPTIONS, EMPTY_FILTERS, LIST_BRANDS_QUERY_KEY } from "../brands.constants";

const BrandsPage = ({ brands = [], isLoading, onRefetch, onDownloadExcel, sideActions = [], filterControls, serverPagination }) => {
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
    entity: ENTITIES.BRANDS,
    queryKey: LIST_BRANDS_QUERY_KEY,
    pageName: PAGES.BRANDS.NAME,
    updateTooltip: "Actualizar marcas",
    downloadTooltip: "Descargar marcas en Excel",
  });
  const handleFilteredBrandsChange = useCallback(handleFilteredElementsChange, [handleFilteredElementsChange]);

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            remote
            entity={ENTITIES.BRANDS}
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
              options={BRAND_STATES_OPTIONS}
              defaultValue={EMPTY_FILTERS.state}
            />
            <TextControlled
              name="id"
              label={FIELD_LABELS.ID}
              placeholder="CG"
              width="8vw"
              minWidth="80px"
            />
            <TextControlled
              name="name"
              label={FIELD_LABELS.NAME}
              placeholder="CallixtoGLM"
              width="20vw"
              minWidth="200px"
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={BRAND_COLUMNS}
        elements={brands}
        page={PAGES.BRANDS}
        serverPagination={serverPagination}
        paginate
        filters={filters}
        setFilters={setFilters}
        onDownloadExcel={useSideActions ? undefined : onDownloadExcel}
        onFilteredElementsChange={useSideActions ? handleFilteredBrandsChange : undefined}
      />
    </>
  );
};

export default BrandsPage;
