import { Flex, FlexColumn, Message } from "@/common/components/custom";
import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { COLORS, DATE_FORMATS, ENTITIES, PAGES } from "@/common/constants";
import { createFilter, getFormatedNumber, preventSend } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { useFilters } from "@/hooks";
import { useMemo } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { CASH_BALANCE_MOVEMENTS_FILTERS_KEY, CASH_BALANCE_MOVEMENTS_TABLE_HEADERS, CASH_BALANCE_MOVEMENTS_TYPE_OPTIONS, EMPTY_CASH_BALANCE_MOVEMENTS_FILTERS } from "../cashBalances.constants";
import { Header } from "./styles";

const CashBalanceMovements = ({ cashBalance }) => {
  const defaultValues = useMemo(() => {
    const budgets = (cashBalance.flows?.budgets || []).map(m => ({
      ...m,
      quantity: parseFloat(m.amount),
      movementId: m.id,
      source: "budget"
    }));
    const expenses = (cashBalance.flows?.expenses || []).map(e => ({
      ...e,
      quantity: -Math.abs(parseFloat(e.amount)),
      movementId: e.id,
      source: "expense"
    }));
    const result = { movements: [...budgets, ...expenses] };
    return result;
  }, [cashBalance]);

  const methods = useForm({ defaultValues });

  const { onRestoreFilters, onSubmit, filters, setFilters, methods: filterMethods } = useFilters({
    defaultFilters: EMPTY_CASH_BALANCE_MOVEMENTS_FILTERS,
    key: CASH_BALANCE_MOVEMENTS_FILTERS_KEY
  });

  const onFilter = createFilter(filters, ['movementId', 'state'], ['state']);

  const { control } = methods;

  const { fields: movementList } = useFieldArray({ control, name: "movements" });

  const filteredList = useMemo(() => {
    const result = movementList
      .filter(item => {
        const isIn = item.quantity > 0;
        const isOut = item.quantity < 0;
        const matchType = filters.type === "all"
          || (filters.type === "in" && isIn)
          || (filters.type === "out" && isOut);
        const matchId = item.movementId?.toLowerCase().includes(filters.movementId?.toLowerCase() || "");
        const matchComments = (item.comments || "").toLowerCase().includes((filters.comments || "").toLowerCase());
        return matchType && matchId && matchComments;
      })
      .map(item => ({
        ...item,
        id: `${item.source}_${item.entityId}_${item.movementId}`,
      }));

    return result;
  }, [filters, movementList]);

  const getPageFor = (movement) =>
    movement?.source === ENTITIES.EXPENSE ? PAGES.EXPENSES : PAGES.BUDGETS;

  return (
    <FlexColumn $rowGap="15px">
      <FormProvider {...filterMethods}>
        <Form onSubmit={onSubmit}>
          <FlexColumn $rowGap="15px">
            <Flex $justifyContent="space-between">
              <Header center>Movimientos de Caja</Header>
              <Flex $columnGap="15px">
                {cashBalance.closeDate &&
                  <Message width="fit-content" alignContent="center" padding="0 10px" height="35px" margin="0" color={COLORS.GREY}>
                    Fecha de cierre: {getFormatedDate(cashBalance?.closeDate, DATE_FORMATS.DATE_WITH_TIME)}
                  </Message>
                }
                <Message width="fit-content" alignContent="center" padding="0 10px" height="35px" margin="0" color={COLORS.BLUE}>
                  Monto inicial: {getFormatedNumber(cashBalance.initialAmount)}
                </Message>
                <Message width="fit-content" alignContent="center" padding="0 10px" height="35px" margin="0" color={COLORS.GREEN}>
                  Monto actual: {getFormatedNumber(cashBalance.currentAmount)}
                </Message>
              </Flex>
            </Flex>
            <Filters
              onRestoreFilters={onRestoreFilters}
            >
              <DropdownControlled
                width="200px"
                name="type"
                options={CASH_BALANCE_MOVEMENTS_TYPE_OPTIONS}
                defaultValue="all"
                afterChange={onSubmit}
              />
              <TextControlled name="movementId" placeholder="Id" width="150px" />
            </Filters>
          </FlexColumn>
        </Form>
      </FormProvider>
      <FormProvider {...methods}>
        <Form onKeyDown={preventSend}>
          <Table
            paginate
            page={{
              SHOW: (_, element) => `${getPageFor(element).SHOW(element.entityId)}?tab=pagos`
            }}
            headers={CASH_BALANCE_MOVEMENTS_TABLE_HEADERS}
            elements={filteredList}
            onFilter={onFilter}
            filters={filters}
            setFilters={setFilters}
          />
        </Form>
      </FormProvider>
    </FlexColumn>
  );
};

export default CashBalanceMovements;


