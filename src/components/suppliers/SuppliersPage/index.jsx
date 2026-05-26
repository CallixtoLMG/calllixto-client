import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { CONTENT_SIZES, ENTITIES, FIELD_LABELS, PAGES } from "@/common/constants";
import { createFilter } from "@/common/utils";
import { useFilters } from "@/hooks";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { EMPTY_FILTERS, SUPPLIERS_COLUMNS, SUPPLIERS_FILTERS_KEY, SUPPLIER_STATES_OPTIONS } from "../suppliers.constants";

const SuppliersPage = ({ isLoading, suppliers = [], onRefetch, onDownloadExcel }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: SUPPLIERS_FILTERS_KEY });

  const onFilter = createFilter(filters, { id: {}, name: {}, state: { fullMatch: true } });

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            entity={ENTITIES.SUPPLIERS}
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            appliedCount={appliedCount}
            hydrated={hydrated}
          >
            <DropdownControlled
              minWidth="150px"
              width={CONTENT_SIZES.MIN}
              name="state"
              label={FIELD_LABELS.STATE}
              options={SUPPLIER_STATES_OPTIONS}
              defaultValue={EMPTY_FILTERS.state}
              afterChange={onSubmit}
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
        onFilter={onFilter}
        paginate
        filters={filters}
        setFilters={setFilters}
        onDownloadExcel={onDownloadExcel}
      />
    </>
  );
};

export default SuppliersPage;
