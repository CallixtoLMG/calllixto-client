import { Dropdown, Flex } from "@/components/common/custom";
import { Filters, Table } from "@/components/common/table";
import { BRANDS_STATES, PAGES } from "@/constants";
import { useFilters } from "@/hooks/useFilters";
import { createFilter } from "@/utils";
import { Controller, FormProvider } from "react-hook-form";
import { Form, Label } from "semantic-ui-react";
import { BRAND_COLUMNS } from "../brands.common";
import { TextControlled } from "@/components/common/form";

const EMPTY_FILTERS = { id: '', name: '', state: BRANDS_STATES.ACTIVE.id };
const STATE_OPTIONS = [
  ...Object.entries(BRANDS_STATES).map(([key, value]) => ({
    key,
    text: (
      <Flex alignItems="center" justifyContent="space-between">
        {value.title}&nbsp;<Label color={value.color} circular empty />
      </Flex>
    ),
    value: key
  }))
];

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
            <Controller
              name="state"
              render={({ field: { onChange, ...rest } }) => (
                <Dropdown
                  {...rest}
                  $maxWidth
                  top="10px"
                  height="35px"
                  minHeight="35px"
                  selection
                  options={STATE_OPTIONS}
                  defaultValue={EMPTY_FILTERS.state}
                  onChange={(e, { value }) => {
                    onChange(value);
                    onSubmit(() => {})();
                  }}
                />
              )}
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
