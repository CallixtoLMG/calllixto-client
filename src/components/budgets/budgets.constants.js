import { Box, Flex, Icon, OverflowWrapper } from "@/common/components/custom";
import { COLORS, DATE_FORMATS, ICONS, SELECT_ALL_OPTION, SORTING } from "@/common/constants";
import { getLabelColor } from "@/common/utils";
import { getDateWithOffset, getFormatedDate, getStartOfUnit, now } from "@/common/utils/dates";
import { parse } from "date-fns";
import { Label, Popup } from "semantic-ui-react";
import { PriceLabel } from "../../common/components/form";
import { CommentTooltip } from "../../common/components/tooltips";
import { getPopupContent, isBudgetCancelled, isBudgetConfirmed } from "./budgets.utils";

export const LIST_BUDGETS_QUERY_KEY = 'listAllBudgets';
export const LIST_BUDGETS_HISTORY_QUERY_KEY = 'getBudgetsHistory';
export const GET_BUDGET_QUERY_KEY = 'getBudget';
export const BUDGETS_FILTERS_KEY = 'budgetsFilters';
export const BUDGETS_HISTORY_FILTERS_KEY = 'budgetsHistoryFilters';
export const LIST_ATTRIBUTES = [
  "id",
  "customer",
  "state",
  "products",
  "globalDiscount",
  "additionalCharge",
  "createdBy",
  "total",
  "confirmedAt",
  "confirmedBy",
  "cancelledAt",
  "cancelledBy",
  "comments",
  "paidAmount",
  "customPDFDisclaimer"
];
export const BUDGETS_VIEW_MONTHS = 3;

export const BUDGET_STATES = {
  CONFIRMED: {
    id: 'CONFIRMED',
    title: 'Confirmados',
    singularTitle: 'Confirmado',
    color: 'green',
    icon: 'check',
  },
  PENDING: {
    id: 'PENDING',
    title: 'Pendientes',
    singularTitle: 'Pendiente',
    color: 'orange',
    icon: 'hourglass half',
  },
  DRAFT: {
    id: 'DRAFT',
    title: 'Borradores',
    singularTitle: 'Borrador',
    color: 'teal',
    icon: 'erase',
  },
  CANCELLED: {
    id: 'CANCELLED',
    title: 'Anulados',
    singularTitle: 'Anulado',
    color: 'red',
    icon: 'ban',
  },
  EXPIRED: {
    id: 'EXPIRED',
    title: 'Expirados',
    singularTitle: 'Expirado',
    color: 'brown',
    icon: 'expired',
  },
};

export const getBudgetColumns = (state = BUDGET_STATES.CONFIRMED.id) => {
  const isConfirmed = state === BUDGET_STATES.CONFIRMED.id;

  const columns = [
    {
      id: 1,
      title: "Id",
      key: "id",
      sortable: true,
      width: 1,
      align: "left",
      value: (budget) => {
        const isPaid = Number(budget?.paidAmount) === Number(budget?.total);
        return (
          <Box width="80px">
            <Flex $alignItems="center">
              {isBudgetConfirmed(budget?.state) || isBudgetCancelled(budget?.state) ? (
                <Popup
                  trigger={
                    <Label ribbon color={getLabelColor(budget, BUDGET_STATES)}>
                      {budget.id}
                    </Label>
                  }
                  content={getPopupContent(budget)}
                  position="right center"
                  size="mini"
                />
              ) : (
                <Label ribbon color={getLabelColor(budget, BUDGET_STATES)}>
                  {budget.id}
                </Label>
              )}
              {isPaid && (
                <Popup
                  content="Pagado"
                  position="right center"
                  size="mini"
                  trigger={
                    <Icon
                      name={ICONS.DOLLAR}
                      color={COLORS.GREEN}
                    />
                  }
                />
              )}
            </Flex>
          </Box>
        );
      },
      sortValue: (budget) => budget.id ?? ""
    },
    {
      id: 2,
      title: "Cliente",
      key: "customer",
      sortable: true,
      align: "left",
      width: 6,
      value: (budget) => (
        <Flex $justifyContent="space-between">
          <OverflowWrapper maxWidth="25vw" popupContent={budget.customer.name}>
            {budget.customer.name}
          </OverflowWrapper>
          {budget.comments && <CommentTooltip comment={budget.comments} />}
        </Flex>
      ),
      sortValue: (budget) => budget.customer.name ?? ""
    },
    {
      id: 3,
      title: "Fecha",
      key: "date",
      sortable: true,
      width: 3,
      value: (budget) => getFormatedDate(budget.createdAt, DATE_FORMATS.DATE_WITH_TIME),
      sortValue: (budget) => budget.createdAt ?? ""
    },
    {
      id: 4,
      title: "Total",
      key: "total",
      sortable: true,
      width: 2,
      value: ({ total }) => <PriceLabel value={total ?? 0} />,
      sortValue: ({ total }) => total ?? 0
    },
  ];

  if (isConfirmed) {
    columns.push(
      {
        id: 5,
        title: "Pagado",
        key: "paidAmount",
        sortable: true,
        width: 2,
        value: (budget) => <PriceLabel value={budget.paidAmount ?? 0} />,
        sortValue: (budget) => budget.paidAmount ?? 0
      },
      {
        id: 6,
        title: "Pendiente",
        key: "pendingAmount",
        sortable: true,
        width: 2,
        value: (budget) => {
          const pending = (budget.total ?? 0) - (budget.paidAmount ?? 0);
          return <PriceLabel value={Math.max(pending, 0)} />;
        },
        sortValue: (budget) =>
          (budget.total ?? 0) - (budget.paidAmount ?? 0)
      }
    );
  }

  columns.push({
    id: isConfirmed ? 7 : 5,
    title: "Vendedor",
    align: "left",
    key: "createdBy",
    sortable: true,
    width: 4,
    value: (budget) => (
      <OverflowWrapper maxWidth="25vw" popupContent={budget.createdBy}>
        {budget.createdBy}
      </OverflowWrapper>
    ),
    sortValue: (budget) => budget.createdBy ?? ""
  });

  return columns;
};

export const PAYMENT_METHODS = [
  { key: 'efectivo', text: 'Efectivo', value: 'Efectivo' },
  { key: 'transferencia', text: 'Transferencia Bancaria', value: 'Transferencia Bancaria' },
  { key: 'debito', text: 'Tarjeta de Débito', value: 'Tarjeta de Débito' },
  { key: 'credito', text: 'Tarjeta de Crédito', value: 'Tarjeta de Crédito' },
  { key: 'mercado_pago', text: 'Mercado Pago', value: 'Mercado Pago' },
  { key: 'dolares', text: 'Dólares', value: 'Dólares' },
  { key: 'others', text: 'Otros', value: 'Otros' },
  { key: 'multi', text: 'Varios', value: 'Varios' }
];

export const BUDGET_PDF_FORMAT = {
  DISPATCH: {
    icon: ICONS.TRUCK,
    key: "dispatch",
    title: "Remito"
  },
  CLIENT: {
    key: 'client',
    icon: ICONS.ADDRESS_CARD,
    title: 'Cliente',
  },
  INTERNAL: {
    key: "internal",
    icon: ICONS.ARCHIVE,
    title: 'Interno'
  },
};

export const PICK_UP_IN_STORE = "Retira en tienda";

export const EMPTY_FILTERS = { id: '', customer: '', createdBy: '', paymentStatus: '', state: SELECT_ALL_OPTION.value, sorting: { key: 'id', direction: SORTING.DESC } };
export const BUDGET_STATES_OPTIONS = [
  SELECT_ALL_OPTION,
  ...Object.values(BUDGET_STATES).map(({ id, title, color }) => (
    {
      key: id,
      text: (
        <Flex $alignItems="center" $justifyContent="space-between">
          {title}&nbsp;<Label color={color} circular empty />
        </Flex>
      ),
      value: id
    }))
];

export const PAYMENT_STATES = {
  PAID: {
    id: 'PAID',
    title: 'Pagados',
    color: 'green',
    icon: 'dollar sign',
  },
  PENDING: {
    id: 'PENDING',
    title: 'Pendientes',
    color: 'orange',
    icon: 'clock outline',
  },
};

export const PAYMENT_STATES_OPTIONS = Object.values(PAYMENT_STATES).map(
  ({ id, title, color }) => ({
    key: id,
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id,
  })
);

export const BUDGET_STATE_TRANSLATIONS = {
  CONFIRMED: BUDGET_STATES.CONFIRMED,
  PENDING: BUDGET_STATES.PENDING,
  EXPIRED: BUDGET_STATES.EXPIRED,
  CANCELLED: BUDGET_STATES.CANCELLED,
  DRAFT: BUDGET_STATES.DRAFT
};

export const BASE_BUDGETS_HISTORY_RANGES = [
  {
    label: "Hoy",
    value: "base_today",
    getRange: () => ({
      startDate: getStartOfUnit(now(), "day"),
      endDate: now(),
    }),
  },
  {
    label: "Esta semana",
    value: "base_week",
    getRange: () => ({
      startDate: getStartOfUnit(now(), "week"),
      endDate: now(),
    }),
  },
  {
    label: "Este mes",
    value: "base_month",
    getRange: () => ({
      startDate: getStartOfUnit(now(), "month"),
      endDate: now(),
    }),
  },
  {
    label: "Este año",
    value: "base_year",
    getRange: () => ({
      startDate: getStartOfUnit(now(), "year"),
      endDate: now(),
    }),
  },
];

const UNIT_CONFIG = {
  day: {
    singular: "día",
    plural: "días",
    article: { singular: "Último", plural: "Últimos" },
  },
  week: {
    singular: "semana",
    plural: "semanas",
    article: { singular: "Última", plural: "Últimas" },
  },
  month: {
    singular: "mes",
    plural: "meses",
    article: { singular: "Último", plural: "Últimos" },
  },
};

export const buildCustomHistoryRanges = (historyDateRanges = []) => {
  return historyDateRanges
    .filter(r => r.unit && r.value)
    .map((range) => {
      const valueNum = Number(range.value);
      const config = UNIT_CONFIG[range.unit];

      const offset =
        range.unit === 'week'
          ? -valueNum * 7
          : -valueNum;

      const unit =
        range.unit === 'week'
          ? 'day'
          : range.unit;

      const raw = getDateWithOffset({
        offset,
        unit,
        format: DATE_FORMATS.ONLY_DATE, 
      });

      const parsedDate = parse(
        raw,
        "dd-MM-yyyy",
        new Date()
      );

      return {
        label:
          valueNum === 1
            ? `${config.article.singular} ${config.singular}`
            : `${config.article.plural} ${valueNum} ${config.plural}`,
        value: range.key,
        getRange: () => ({
          startDate: parsedDate,
          endDate: new Date(),
        }),
      };
    });
};

export const DATE_RANGE_KEY = "budgets-history-date-range";

export const DEFAULT_DATE_RANGE_VALUE = 3;