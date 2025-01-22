import { Dropdown, Flex, Input } from "@/components/common/custom";
import { Filters, Table } from "@/components/common/table";
import { EXPENSE_STATES, PAGES } from "@/constants";
import { useFilters } from "@/hooks/useFilters";
import { createFilter } from "@/utils";
import { Controller, FormProvider } from "react-hook-form";
import { Form, Label } from "semantic-ui-react";
import { EXPENSE_COLUMNS } from "../expenses.common";

const EMPTY_FILTERS = { id: '', name: '', category: ""};
const STATE_OPTIONS = [
  ...Object.entries(EXPENSE_STATES).map(([key, value]) => ({
    key,
    text: (
      <Flex alignItems="center" justifyContent="space-between">
        {value.title}&nbsp;<Label color={value.color} circular empty />
      </Flex>
    ),
    value: key
  }))
];

const ExpensesPage = ({ expenses = [], isLoading, onRefetch }) => {
  console.log("expenses", expenses)
  const {
    onRestoreFilters,
    onSubmit,
    appliedFilters,
    methods
  } = useFilters(EMPTY_FILTERS);

  const onFilter = createFilter(appliedFilters, []);
  console.log("onFilter", onFilter)

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit(() => { })}>
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
                    onSubmit(() => { })();
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
            <Controller
              name="category"
              render={({ field }) => (
                <Input
                  {...field}
                  $marginBottom
                  $maxWidth
                  height="35px"
                  placeholder="Categoria"
                />
              )}
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={EXPENSE_COLUMNS}
        elements={expenses}
        page={PAGES.EXPENSES}
        onFilter={onFilter}
        paginate
      />
    </>
  );
};

export default ExpensesPage;
