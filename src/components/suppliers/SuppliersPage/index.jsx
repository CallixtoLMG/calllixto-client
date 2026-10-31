import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { CONTENT_SIZES, FIELD_LABELS, PAGES, SORTING } from "@/common/constants";
import { useListPageSideActions } from "@/components/layout";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { SUPPLIER_SORT_FIELDS, SUPPLIERS_COLUMNS, SUPPLIER_STATES_OPTIONS } from "../suppliers.constants";

const SuppliersPage = ({ isLoading, suppliers = [], list, total, sideActions = [] }) => {
  const {
    onRestoreFilters,
    onSubmit,
    methods,
    appliedCount,
    hydrated
  } = list;

  useListPageSideActions({ sideActions });

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            onRestoreFilters={onRestoreFilters}
            appliedCount={appliedCount}
            hydrated={hydrated}
            showRefetchAction={false}
          >
            <DropdownControlled
              minWidth="150px"
              width={CONTENT_SIZES.MIN}
              name="state"
              label={FIELD_LABELS.STATE}
              options={SUPPLIER_STATES_OPTIONS}
              clearable
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
        paginate
        serverPagination={{
          hydrated,
          pageNumber: list.pageNumber,
          pageSize: list.pageSize,
          total,
          sorting: {
            key: Object.keys(SUPPLIER_SORT_FIELDS).find((key) => SUPPLIER_SORT_FIELDS[key] === list.sort),
            direction: list.order === "desc" ? SORTING.DESC : SORTING.ASC,
          },
          sortFields: SUPPLIER_SORT_FIELDS,
          onPageChange: list.setPageNumber,
          onPageSizeChange: list.setPageSize,
          onSortChange: list.setSorting,
        }}
      />
    </>
  );
};

export default SuppliersPage;
