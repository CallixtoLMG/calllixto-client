import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { CONTENT_SIZES, PAGES, SORTING } from "@/common/constants";
import { useListPageSideActions } from "@/components/layout";
import { useEffect, useMemo } from "react";
import { FormProvider, useWatch } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { BUDGET_SORT_FIELDS, BUDGET_STATES, BUDGET_STATES_OPTIONS, PAYMENT_STATES_OPTIONS, getBudgetColumns } from "./budgets.constants";

const ServerBudgetsPage = ({ budgets = [], list, total, isLoading, actions, sideActions }) => {
  const { methods, onSubmit, onRestoreFilters, hydrated, appliedCount } = list;
  const draftState = useWatch({ control: methods.control, name: "state" });
  const { setValue } = methods;
  useEffect(() => {
    if (draftState !== BUDGET_STATES.CONFIRMED.id) setValue("paymentStatus", "");
  }, [draftState, setValue]);
  const headers = useMemo(() => getBudgetColumns(list.appliedFilters.state).map((header) => ({
    ...header, sortable: Object.hasOwn(BUDGET_SORT_FIELDS, header.key),
  })), [list.appliedFilters.state]);
  useListPageSideActions({ sideActions });

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters onRestoreFilters={onRestoreFilters} hydrated={hydrated} appliedCount={appliedCount} showRefetchAction={false}>
            <DropdownControlled
              name="state" label="Estado" options={BUDGET_STATES_OPTIONS}
              width={CONTENT_SIZES.MIN} minWidth="150px" clearable
            />
            <TextControlled name="id" label="Id" placeholder="MI525" width="8vw" minWidth="100px" />
            <TextControlled name="customer" label="Cliente" placeholder="Martín Bueno" width="13vw" minWidth="120px" />
            <TextControlled name="createdBy" label="Vendedor" placeholder="Nombre completo" width="13vw" minWidth="125px" />
            {draftState === BUDGET_STATES.CONFIRMED.id && (
              <DropdownControlled
                name="paymentStatus" label="Estado de pago" options={PAYMENT_STATES_OPTIONS}
                width="130px" minWidth={CONTENT_SIZES.MIN} clearable
              />
            )}
          </Filters>
        </Form>
      </FormProvider>
      <Table
        elements={budgets} headers={headers} page={PAGES.BUDGETS} actions={actions}
        isLoading={isLoading} paginate color={BUDGET_STATES[list.appliedFilters.state]?.color} $ribbonOverflow
        serverPagination={{
          hydrated, total, pageNumber: list.pageNumber, pageSize: list.pageSize,
          sorting: {
            key: Object.keys(BUDGET_SORT_FIELDS).find((key) => BUDGET_SORT_FIELDS[key] === list.sort),
            direction: list.order === "desc" ? SORTING.DESC : SORTING.ASC,
          },
          sortFields: BUDGET_SORT_FIELDS,
          onPageChange: list.setPageNumber, onPageSizeChange: list.setPageSize, onSortChange: list.setSorting,
        }}
      />
    </>
  );
};

export default ServerBudgetsPage;
