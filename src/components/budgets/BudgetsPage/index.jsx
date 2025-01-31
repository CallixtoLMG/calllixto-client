import { Dropdown, Flex, Input } from '@/components/common/custom';
import { Filters, Table } from '@/components/common/table';
import { ALL, COLORS, ICONS, PAGES } from "@/common/constants";
import { useFilters } from "@/hooks/useFilters";
import { createFilter } from '@/common/utils';
import { useRouter } from "next/navigation";
import { Controller, FormProvider } from 'react-hook-form';
import { Form, Label } from 'semantic-ui-react';
import { BUDGET_STATES, BUDGETS_COLUMNS } from "../budgets.constants";

const DEFAULT_STATE = { key: ALL, value: ALL, text: 'Todos' };
const EMPTY_FILTERS = { id: '', customer: '', seller: '', state: DEFAULT_STATE.value };
const STATE_OPTIONS = [
  DEFAULT_STATE,
  ...Object.entries(BUDGET_STATES).map(([key, value]) => (
    {
      key,
      text: (
        <Flex alignItems="center" justifyContent="space-between">
          {value.title}&nbsp;<Label color={value.color} circular empty />
        </Flex>
      ),
      value: key
    }))
];

const BudgetsPage = ({ budgets, isLoading, onRefetch }) => {
  const { push } = useRouter();

  const {
    onRestoreFilters,
    onSubmit,
    appliedFilters,
    methods
  } = useFilters(EMPTY_FILTERS);

  const onFilter = createFilter(appliedFilters, ['id', 'customer', 'seller'], {
    customer: budget => budget.customer?.name || '',
    allState: ALL,
  });

  const actions = [
    {
      id: 1,
      icon: ICONS.COPY,
      color: COLORS.GREEN,
      onClick: (budget) => { push(PAGES.BUDGETS.CLONE(budget?.id)) },
      tooltip: 'Clonar'
    }
  ];

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit(() => {})}>
          <Filters onRefetch={onRefetch} onRestoreFilters={onRestoreFilters}>
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
                  defaultValue={DEFAULT_STATE.value}
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
              name="customer"
              render={({ field }) => (
                <Input
                  {...field}
                  $maxWidth
                  $marginBottom
                  height="35px"
                  placeholder="Cliente"
                />
              )}
            />
            <Controller
              name="seller"
              render={({ field }) => (
                <Input
                  {...field}
                  $marginBottom
                  $maxWidth
                  height="35px"
                  placeholder="Vendedor"
                />
              )}
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={BUDGETS_COLUMNS}
        elements={budgets}
        page={PAGES.BUDGETS}
        actions={actions}
        color={BUDGET_STATES[appliedFilters.state]?.color}
        onFilter={onFilter}
        paginate
      />
    </>
  );
};

export default BudgetsPage;
