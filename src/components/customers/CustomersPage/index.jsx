import { DropdownControlled, TextControlled } from '@/common/components/form';
import { Filters, Table } from '@/common/components/table';
import { CONTENT_SIZES, FIELD_LABELS, PAGES, SORTING } from "@/common/constants";
import { useListPageSideActions } from "@/components/layout";
import { FormProvider } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { CUSTOMER_SORT_FIELDS, CUSTOMER_STATES_OPTIONS, HEADERS } from "../customers.constants";

const CustomersPage = ({ customers = [], isLoading, list, total, sideActions = [] }) => {
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
              options={CUSTOMER_STATES_OPTIONS}
              clearable
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
        paginate
        serverPagination={{
          hydrated,
          pageNumber: list.pageNumber,
          pageSize: list.pageSize,
          total,
          sorting: {
            key: Object.keys(CUSTOMER_SORT_FIELDS).find((key) => CUSTOMER_SORT_FIELDS[key] === list.sort),
            direction: list.order === "desc" ? SORTING.DESC : SORTING.ASC,
          },
          sortFields: CUSTOMER_SORT_FIELDS,
          onPageChange: list.setPageNumber,
          onPageSizeChange: list.setPageSize,
          onSortChange: list.setSorting,
        }}
      />
    </>
  );
};

export default CustomersPage;
