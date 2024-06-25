import { Filters, Table } from '@/components/common/table';
import { usePaginationContext } from "@/components/common/table/Pagination";
import { BUDGET_STATES, PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { BUDGETS_COLUMNS } from "../budgets.common";
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Form, Label } from 'semantic-ui-react';
import { Dropdown, Input } from '@/components/common/custom';
import { Flex } from 'rebass';

const DEFAULT_STATE = { key: 'ALL', value: 'ALL', text: 'Todos' };
const EMPTY_FILTERS = { id: '', customer: '', seller: '', state: DEFAULT_STATE };
const STATE_OPTIONS = [
  DEFAULT_STATE,
  ...Object.keys(BUDGET_STATES).map(key => (
    {
      key,
      text: <Flex alignItems="center" justifyContent="space-between">{BUDGET_STATES[key].title}&nbsp;<Label color={BUDGET_STATES[key].color} circular empty /></Flex>,
      value: key
    }))
];

const BudgetsPage = ({ budgets, isLoading }) => {
  const { push } = useRouter();
  const { resetFilters } = usePaginationContext();
  const methods = useForm();
  const { handleSubmit, control, reset, getValues } = methods;
  const [selectedStateColor, setSelectedStateColor] = useState();

  const onFilter = (data) => {
    const filters = { ...data };
    if (data.code) {
      filters.sort = "id";
    }
    if (data.customer) {
      filters.sort = "customer";
    }
    if (data.seller) {
      filters.sort = "seller";
    }
    if (data.state === 'ALL') {
      delete filters.state;
    }
    setSelectedStateColor(Object.values(BUDGET_STATES).find(state => state.id === filters.state)?.color);
    resetFilters(filters);
  };

  const actions = [
    {
      id: 1,
      icon: 'copy',
      color: 'green',
      onClick: (budget) => { push(PAGES.BUDGETS.CLONE(budget?.id)) },
      tooltip: 'Clonar'
    },
  ];

  const onRestoreFilters = () => {
    reset(EMPTY_FILTERS);
    onFilter(EMPTY_FILTERS);
  }

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onFilter)}>
          <Filters onRestoreFilters={onRestoreFilters}>
            <Controller
              name="state"
              control={control}
              render={({ field: { onChange, value, ...rest } }) => (
                <Dropdown
                  {...rest}
                  width="500px"
                  margin="0"
                  top="10px"
                  height="fit-content"
                  selection
                  fluid
                  options={STATE_OPTIONS}
                  defaultValue={STATE_OPTIONS[0].value}
                  value={value?.key}
                  onChange={(e, { value }) => {
                    onChange(value);
                    handleSubmit(onFilter)();
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
                  height="35px"
                  margin="0"
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
                  height="35px"
                  margin="0"
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
                  height="35px"
                  margin="0"
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
        color={selectedStateColor}
        showPagination
      />
    </>

  )
};

export default BudgetsPage;
