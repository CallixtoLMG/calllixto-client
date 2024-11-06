import { Dropdown, Flex, Input } from '@/components/common/custom';
import { Filters, Table } from '@/components/common/table';
import { ALL, BUDGET_STATES, COLORS, ICONS, PAGES } from "@/constants";
import { createFilter } from '@/utils';
import { useRouter } from "next/navigation";
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
  const { handleSubmit, control, reset, watch } = useForm();
  const [watchState] = watch(['state']);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const keysToFilter = ['id', 'customer', 'seller'];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  const onFilter = useCallback(createFilter(filters, keysToFilter, {
    customer: budget => budget.customer?.name || '',
    allState: ALL,
  }), [filters]);

  const actions = [
    {
      id: 1,
      icon: ICONS.COPY,
      color: COLORS.GREEN,
      onClick: (budget) => { push(PAGES.BUDGETS.CLONE(budget?.id)) },
      tooltip: 'Clonar'
    }
  ];

  const onRestoreFilters = () => {
    reset(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  }

  return (
    <>
      <Form onSubmit={handleSubmit(setFilters)}>
        <Filters onRefetch={onRefetch} onRestoreFilters={onRestoreFilters}>
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
                defaultValue={STATE_OPTIONS[0].key}
                onChange={(e, { value }) => {
                  onChange(value);
                  setFilters({ ...filters, state: value });
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
        color={BUDGET_STATES[watchState]?.color}
        onFilter={onFilter}
        paginate
      />
    </>

  )
};

export default BudgetsPage;
