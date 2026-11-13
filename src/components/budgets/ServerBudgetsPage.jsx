import { Button, Icon } from "@/common/components/custom";
import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { FiltersContainer, HeaderSegment } from "@/common/components/table/styles";
import { CONTENT_SIZES, ICONS, PAGES, toUiSorting } from "@/common/constants";
import { useListPageSideActions } from "@/components/layout";
import { useEffect, useMemo } from "react";
import { FormProvider, useWatch } from "react-hook-form";
import { Form, Message, Popup } from "semantic-ui-react";
import styled from "styled-components";
import SalesDateFilters from "./SalesDateFilters";
import { BUDGET_SORT_FIELDS, BUDGET_STATES, BUDGET_STATES_OPTIONS, PAYMENT_STATES_OPTIONS, getBudgetColumns } from "./budgets.constants";

const SalesFiltersForm = styled(Form)`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  .react-datepicker-popper { z-index: 31; }
`;

const BudgetsTableLayer = styled.div`
  .ui.table { isolation: isolate; }
  .ui.loader { z-index: 1; }
`;

const FilterFields = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;
  min-width: 0;
  .field { margin: 0 !important; }
  .react-datepicker-wrapper, .react-datepicker__input-container { width: 100%; }
  @media (max-width: 767px) {
    width: 100%;
    > .field { width: 100% !important; }
  }
`;

const ServerBudgetsPage = ({
  budgetsList = [], list, total, isLoading, actions, sideActions, datePresets, customerScoped, error,
  sortFields = BUDGET_SORT_FIELDS,
}) => {
  const { methods, onSubmit, onRestoreDates, onRestoreFilters, hydrated, appliedCount } = list;
  const draftState = useWatch({ control: methods.control, name: "state" });
  const { setValue } = methods;
  useEffect(() => {
    if (draftState !== BUDGET_STATES.CONFIRMED.id) setValue("paymentStatus", "");
  }, [draftState, setValue]);
  const headers = useMemo(() => getBudgetColumns(list.appliedFilters.state).map((header) => ({
    ...header, sortable: Object.hasOwn(sortFields, header.key),
  })), [list.appliedFilters.state, sortFields]);
  useListPageSideActions({ sideActions });

  return (
    <>
      <FormProvider {...methods}>
        <SalesFiltersForm onSubmit={onSubmit}>
          <HeaderSegment role="group" aria-label="Fechas de ventas">
            <FiltersContainer>
              <Popup content="Restaurar fechas" trigger={(
                <Button circular icon type="button" aria-label="Restaurar fechas" disabled={!hydrated}
                  $marginBottom="2px" $alignSelf="flex-end" width={CONTENT_SIZES.FIT}
                  $fontSize="14px" $paddingLeft="11px" padding="11px" onClick={onRestoreDates}>
                  <Icon name={ICONS.UNDO} />
                </Button>
              )} />
              <FilterFields>
                <SalesDateFilters presets={datePresets} disabled={!hydrated} optional={customerScoped} />
              </FilterFields>
            </FiltersContainer>
          </HeaderSegment>
          <Filters onRestoreFilters={onRestoreFilters} hydrated={hydrated} appliedCount={appliedCount}>
            <FilterFields>
              <DropdownControlled
                name="state" label="Estado" options={BUDGET_STATES_OPTIONS}
                width={CONTENT_SIZES.MIN} minWidth="150px" clearable
              />
              <TextControlled name="id" label="Id" placeholder="MI525" width="8vw" minWidth="100px" />
              {!customerScoped && (
                <TextControlled name="customer" label="Cliente" placeholder="Martín Bueno" width="13vw" minWidth="120px" />
              )}
              <TextControlled name="createdBy" label="Vendedor" placeholder="Nombre completo" width="13vw" minWidth="125px" />
              {draftState === BUDGET_STATES.CONFIRMED.id && (
                <DropdownControlled
                  name="paymentStatus" label="Estado de pago" options={PAYMENT_STATES_OPTIONS}
                  width="130px" minWidth={CONTENT_SIZES.MIN} clearable
                />
              )}
            </FilterFields>
          </Filters>
        </SalesFiltersForm>
      </FormProvider>
      {error ? (
        <Message negative role="alert" header="No se pudieron cargar los presupuestos." content={error.message} />
      ) : (
        <BudgetsTableLayer>
          <Table
            elements={budgetsList} headers={headers} page={PAGES.BUDGETS} actions={actions}
            isLoading={isLoading} paginate color={BUDGET_STATES[list.appliedFilters.state]?.color} $ribbonOverflow
            serverPagination={{
              hydrated, total, pageNumber: list.pageNumber, pageSize: list.pageSize,
              sorting: {
                key: Object.keys(sortFields).find((key) => sortFields[key] === list.sort),
                direction: toUiSorting(list.order),
              },
              sortFields,
              onPageChange: list.setPageNumber, onPageSizeChange: list.setPageSize, onSortChange: list.setSorting,
            }}
          />
        </BudgetsTableLayer>
      )}
    </>
  );
};

export default ServerBudgetsPage;
