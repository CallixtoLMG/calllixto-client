import { Filters, Table } from "@/components/common/table";
import { PAGES } from "@/constants";
import { useFilters } from "@/hooks/useFilters";
import { createFilter } from "@/utils";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { BRAND_COLUMNS, BRANDS_STATES_OPTIONS, EMPTY_FILTERS } from "../brands.common";
import { DropdownControlled, TextControlled } from "@/components/common/form";

const BrandsPage = ({ brands = [], isLoading, onRefetch }) => {
  const {
    onRestoreFilters,
    onSubmit,
    appliedFilters,
    methods
  } = useFilters(EMPTY_FILTERS);

  const onFilter = createFilter(appliedFilters, ['name', 'id']);

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
              options={BRANDS_STATES_OPTIONS}
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
        headers={BRAND_COLUMNS}
        elements={brands}
        page={PAGES.BRANDS}
        onFilter={onFilter}
        paginate
      />
    </>
  );
};

export default BrandsPage;
