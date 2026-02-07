import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { ENTITIES, PAGES } from "@/common/constants";
import { createFilter } from "@/common/utils";
import { useFilters } from "@/hooks";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { BRANDS_FILTERS_KEY, BRAND_COLUMNS, BRAND_STATES_OPTIONS, EMPTY_FILTERS } from "../brands.constants";

const BrandsPage = ({ brands = [], isLoading, onRefetch, onDownloadExcel }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: BRANDS_FILTERS_KEY });

  const onFilter = createFilter(filters, { name: {}, id: {}, state: { fullMatch: true } });

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            entity={ENTITIES.BRANDS}
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            appliedCount={appliedCount}
            hydrated={hydrated}
          >
            <DropdownControlled
              width="200px"
              name="state"
              label="Estado"
              options={BRAND_STATES_OPTIONS}
              defaultValue={EMPTY_FILTERS.state}
              afterChange={onSubmit}
            />
            <TextControlled name="id" label="Id" placeholder="CG" width="80px" />
            <TextControlled name="name" label="Nombre" placeholder="CallixtoGLM" width="300px" />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={BRAND_COLUMNS}
        elements={brands}
        page={PAGES.BRANDS}
        onFilter={onFilter}
        paginate
        filters={filters}
        setFilters={setFilters}
        onDownloadExcel={onDownloadExcel}
      />
    </>
  );
};

export default BrandsPage;
