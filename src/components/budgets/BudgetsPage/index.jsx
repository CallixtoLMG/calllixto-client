import { Dropdown, Flex, Input } from '@/components/common/custom';
import { Filters, Table } from '@/components/common/table';
import { usePaginationContext } from "@/components/common/table/Pagination";
import { BUDGET_STATES, PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Form, Label } from 'semantic-ui-react';
import { BUDGETS_COLUMNS } from "../budgets.common";

const DEFAULT_STATE = { key: 'ALL', value: 'ALL', text: 'Todos' };
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

const BudgetsPage = ({ budgets, isLoading }) => {
  const { push } = useRouter();
  const { resetFilters } = usePaginationContext();
  const methods = useForm();
  const { handleSubmit, control, reset, setValue, watch } = methods;
  const [watchState] = watch(['state']);

  const onFilter = (data) => {
    const filters = { ...data };
    if (data.id) {
      filters.sort = "id";
      setValue('state', DEFAULT_STATE.value);
      delete filters.state;
    }
    if (data.customer) {
      filters.sort = "customer";
      if (data.state === DEFAULT_STATE.value) {
        setValue('state', BUDGET_STATES.PENDING.id);
      }
    }
    if (data.seller) {
      filters.sort = "seller";
      if (data.state === DEFAULT_STATE.value) {
        setValue('state', BUDGET_STATES.PENDING.id);
      }
    }
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
              render={({ field: { onChange, ...rest } }) => (
                <Dropdown
                  {...rest}
                  maxWidth
                  top="10px"
                  height="35px"
                  minHeight="35px"
                  selection
                  options={STATE_OPTIONS}
                  defaultValue={STATE_OPTIONS[0].key}
                  onChange={(e, { value }) => {
                    setValue('id', '');
                    if (value === DEFAULT_STATE.value) {
                      setValue('customer', '');
                      setValue('seller', '');
                    }
                    onChange(value);
                    handleSubmit(onFilter)();
                  }}
                />
              )}
            />
            <Controller
              name="id"
              control={control}
              render={({ field: { onChange, ...rest } }) => (
                <Input
                  {...rest}
                  $marginBottom
                  maxWidth
                  height="35px"
                  placeholder="Id"
                  onChange={(e) => {
                    setValue('customer', '');
                    setValue('seller', '');
                    onChange(e.target.value);
                  }}
                />
              )}
            />
            <Controller
              name="customer"
              control={control}
              render={({ field: { onChange, ...rest } }) => (
                <Input
                  {...rest}
                  maxWidth
                  $marginBottom
                  height="35px"
                  placeholder="Cliente"
                  onChange={(e) => {
                    setValue('id', '');
                    setValue('seller', '');
                    onChange(e.target.value);
                  }}
                />
              )}
            />
            <Controller
              name="seller"
              control={control}
              render={({ field: { onChange, ...rest } }) => (
                <Input
                  {...rest}
                  $marginBottom
                  maxWidth
                  height="35px"
                  placeholder="Vendedor"
                  onChange={(e) => {
                    setValue('id', '');
                    setValue('customer', '');
                    onChange(e.target.value);
                  }}
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
        color={BUDGET_STATES[watchState]?.color}
        showPagination
      />
    </>

  )
};

export default BudgetsPage;
