import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { ENTITIES, PAGES } from "@/common/constants";
import { createFilter } from "@/common/utils";
import { useFilters } from "@/hooks";
import { useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { CASH_BALANCES_FILTERS_KEY, CASH_BALANCE_STATES_OPTIONS, EMPTY_FILTERS, getCashBalanceColumns } from "../cashBalances.constants";
const CashBalance = ({ cashBalances = [], isLoading, onRefetch }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: CASH_BALANCES_FILTERS_KEY });

  const onFilter = createFilter(filters, ['id']);
  const cashBalanceColumns = useMemo(() => getCashBalanceColumns(filters.state), [filters.state]);
  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            entity={ENTITIES.CASH_BALANCES}
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            appliedCount={appliedCount}
            hydrated={hydrated}
          >
            <DropdownControlled
              width="200px"
              name="state"
              options={CASH_BALANCE_STATES_OPTIONS}
              defaultValue={EMPTY_FILTERS.state}
              afterChange={onSubmit}
            />
            <TextControlled name="id" placeholder="Id" width="80px" />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={cashBalanceColumns}
        elements={cashBalances}
        page={PAGES.CASH_BALANCES}
        onFilter={onFilter}
        paginate
        filters={filters}
        setFilters={setFilters}
      />
    </>
  );
};

export default CashBalance;
