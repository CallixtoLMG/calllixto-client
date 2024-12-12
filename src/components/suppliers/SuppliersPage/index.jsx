import { Dropdown, Flex, Input } from "@/components/common/custom";
import { Filters, Table } from "@/components/common/table";
import { PAGES, SUPPLIER_STATES } from "@/constants";
import { useFilters } from "@/hooks/useFilters";
import { createFilter } from "@/utils";
import { Controller, FormProvider } from "react-hook-form";
import { Form, Label } from "semantic-ui-react";
import { SUPPLIERS_COLUMNS } from "../suppliers.common";

const EMPTY_FILTERS = { id: '', name: '', state: SUPPLIER_STATES.ACTIVE.id };
const STATE_OPTIONS = [
  ...Object.entries(SUPPLIER_STATES).map(([key, value]) => ({
    key,
    text: (
      <Flex alignItems="center" justifyContent="space-between">
        {value.title}&nbsp;<Label color={value.color} circular empty />
      </Flex>
    ),
    value: key
  }))
];

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
            <Controller
              name="id"
              render={({ field }) => (
                <Input
                  {...field}
                  $marginBottom
                  $maxWidth
                  height="35px"
                  placeholder="Id"
                />
              )}
            />
            <Controller
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  $marginBottom
                  $maxWidth
                  height="35px"
                  placeholder="Nombre"
                />
              )}
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
      />
    </>
  );
};

export default SuppliersPage;
