import { Filters, Table } from "@/components/common/table";
import { PAGES } from "@/constants";
import { useFilters } from "@/hooks/useFilters";
import { createFilter } from "@/utils";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { EMPTY_FILTERS, SUPPLIER_STATES_OPTIONS, SUPPLIERS_COLUMNS } from "../suppliers.common";
import { DropdownControlled, TextControlled } from "@/components/common/form";

const SuppliersPage = ({ isLoading, suppliers = [], onRefetch }) => {
  const {
    onRestoreFilters,
    onSubmit,
    appliedFilters,
    methods
  } = useFilters(EMPTY_FILTERS);

  const onFilter = createFilter(appliedFilters, ['id', 'name']);

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit(() => {})}>
          <Filters
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
          >
            <DropdownControlled
              width="200px"
              name="state"
              options={SUPPLIER_STATES_OPTIONS}
              defaultValue={EMPTY_FILTERS.state}
              afterChange={() => {
                onSubmit(() => {})();
              }}
            />
            <TextControlled name="id" placeholder="Id" width="80px" />
            <TextControlled name="name" placeholder="Nombre" width="300px" />
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
      />
    </>
  );
};

export default SuppliersPage;
