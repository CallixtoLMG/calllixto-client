import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { ENTITIES, PAGES } from "@/common/constants";
import { createFilter } from "@/common/utils";
import { useFilters, useSettingArrayField } from "@/hooks";
import { useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import {
  CASH_BALANCES_FILTERS_KEY,
  CASH_BALANCE_STATES_OPTIONS,
  EMPTY_FILTERS,
  getCashBalanceColumns
} from "../cashBalances.constants";

const CashBalancesPage = ({ cashBalances = [], isLoading, onRefetch, paymentOptions, onDownloadExcel }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: CASH_BALANCES_FILTERS_KEY });

  const normalizedCashBalances = useMemo(() => {
    return cashBalances.map(cashBalance => ({
      ...cashBalance,
      paymentMethodsText: cashBalance.paymentMethods?.join(", ") ?? ""
    }));
  }, [cashBalances]);

  const adjustedFilters = {
    ...filters,
    paymentMethodsText: filters.paymentMethods
  };

  const onFilter = createFilter(adjustedFilters, ["id", "paymentMethodsText"]);

  const cashBalanceColumns = useMemo(
    () => getCashBalanceColumns(filters.state),
    [filters.state]
  );

  const { options: tagsOptions } = useSettingArrayField(
    ENTITIES.GENERAL,
    "paymentMethods",
    paymentOptions ?? []
  );

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            entity={ENTITIES.CASHBALANCES}
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
            <DropdownControlled
              width="200px"
              name="paymentMethods"
              placeholder="Método de pago"
              options={tagsOptions}
              defaultValue={EMPTY_FILTERS.paymentMethods}
              afterChange={onSubmit}
              textMaxWidth="fit-content"
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={cashBalanceColumns}
        elements={normalizedCashBalances}
        page={PAGES.CASH_BALANCES}
        onFilter={onFilter}
        paginate
        filters={filters}
        setFilters={setFilters}
        onDownloadExcel={onDownloadExcel}
      />
    </>
  );
};

export default CashBalancesPage;
