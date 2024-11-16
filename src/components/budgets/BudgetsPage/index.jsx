import { Dropdown, Flex, Input } from '@/components/common/custom';
import { Filters, Table } from '@/components/common/table';
import { ALL, BUDGET_STATES, COLORS, ICONS, PAGES } from "@/constants";
import { useFilters } from "@/hooks/useFilters";
import { createFilter } from '@/utils';
import { useRouter } from "next/navigation";
import { Controller } from 'react-hook-form';
import { Form, Label } from 'semantic-ui-react';
import { BUDGETS_COLUMNS } from "../budgets.common";

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
    control,
    hasUnsavedFilters,
    onRestoreFilters,
    onSubmit,
    onStateChange,
    appliedFilters,
  } = useFilters(EMPTY_FILTERS, ['id', 'customer', 'seller']);

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
      <Form onSubmit={onSubmit(() => { })}>
        <Filters onRefetch={onRefetch} onRestoreFilters={onRestoreFilters} hasUnsavedFilters={hasUnsavedFilters()}>
          <Controller
            name="state"
            control={control}
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
                  onStateChange(value);
                }}
              />
            )}
          />
          <Controller
            name="id"
            control={control}
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
            control={control}
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
            control={control}
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
