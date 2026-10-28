import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { CONTENT_SIZES, ENTITIES, PAGES, SELECT_ALL_OPTION } from "@/common/constants";
import { useListPageSideActions } from "@/components/layout";
import { useCallback, useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import {
  CASH_BALANCE_STATES_OPTIONS,
  LIST_CASH_BALANCES_QUERY_KEY,
  getCashBalanceColumns
} from "../cashBalances.constants";

const CashBalancesPage = ({ cashBalances = [], isLoading, onRefetch, paymentOptions, onDownloadExcel, sideActions = [], filterControls, serverPagination }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = filterControls;

  const normalizedCashBalances = useMemo(() => {
    return cashBalances.map(cashBalance => ({
      ...cashBalance,
      paymentMethodsText: cashBalance.paymentMethods?.join(", ") ?? ""
    }));
  }, [cashBalances]);

  const { useSideActions, handleFilteredElementsChange } = useListPageSideActions({
    remote: true,
    sideActions,
    onRefetch,
    onDownloadExcel,
    entity: ENTITIES.CASHBALANCES,
    queryKey: LIST_CASH_BALANCES_QUERY_KEY,
    pageName: PAGES.CASH_BALANCES.NAME,
    updateTooltip: "Actualizar cajas",
    downloadTooltip: "Descargar cajas en Excel",
  });
  const handleFilteredCashBalancesChange = useCallback(handleFilteredElementsChange, [handleFilteredElementsChange]);

  const cashBalanceColumns = useMemo(
    () => getCashBalanceColumns(filters.state),
    [filters.state]
  );

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            remote
            entity={ENTITIES.CASHBALANCES}
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            appliedCount={appliedCount}
            hydrated={hydrated}
            showRefetchAction={!useSideActions}
          >
            <DropdownControlled
              minWidth="150px"
              width={CONTENT_SIZES.MIN}
              name="state"
              label="Estado"
              options={CASH_BALANCE_STATES_OPTIONS}
            />
            <TextControlled
              name="id"
              label="Id"
              placeholder="A0009"
              width="8vw"
              minWidth="100px"
            />
            <DropdownControlled
              $minWidth="200px"
              width="18vw"
              name="paymentMethods"
              label="Método de pago"
              placeholder="Efectivo"
              options={[SELECT_ALL_OPTION, ...paymentOptions]}
              textMaxWidth={CONTENT_SIZES.FIT}
              height="35px"
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={cashBalanceColumns}
        elements={normalizedCashBalances}
        page={PAGES.CASH_BALANCES}
        serverPagination={serverPagination}
        paginate
        filters={filters}
        setFilters={setFilters}
        onDownloadExcel={useSideActions ? undefined : onDownloadExcel}
        onFilteredElementsChange={useSideActions ? handleFilteredCashBalancesChange : undefined}
      />
    </>
  );
};

export default CashBalancesPage;
