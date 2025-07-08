import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from '@/common/components/table';
import { COLORS, ENTITIES, ICONS, PAGES, SELECT_ALL_OPTION } from "@/common/constants";
import { createFilter } from '@/common/utils';
import { useFilters } from "@/hooks";
import { useRouter } from "next/navigation";
import { FormProvider } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { BUDGET_STATES, BUDGET_STATES_OPTIONS, BUDGETS_COLUMNS, BUDGETS_FILTERS_KEY, EMPTY_FILTERS } from "../budgets.constants";

const BudgetsPage = ({ budgets, isLoading, onRefetch }) => {
  const { push } = useRouter();

  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: BUDGETS_FILTERS_KEY});

  const onFilter = createFilter(filters, ['id', 'customer', 'seller'], {
    customer: budget => budget.customer?.name || '',
    allState: SELECT_ALL_OPTION.value,
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
        <Form onSubmit={onSubmit}>
          <Filters
            entity={ENTITIES.BUDGETS}
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
          >
            <DropdownControlled
              width="200px"
              name="state"
              options={BUDGET_STATES_OPTIONS}
              defaultValue={SELECT_ALL_OPTION.state}
              afterChange={onSubmit}
            />
            <TextControlled
              width="120px"
              name="id"
              placeholder="Id"
            />
            <TextControlled
              flex="1"
              name="customer"
              placeholder="Cliente"
            />
            <TextControlled
              flex="1"
              name="seller"
              placeholder="Vendedor"
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
        color={BUDGET_STATES[filters.state]?.color}
        onFilter={onFilter}
        paginate
        filters={filters}
        setFilters={setFilters}
      />
    </>
  );
};

export default BudgetsPage;
