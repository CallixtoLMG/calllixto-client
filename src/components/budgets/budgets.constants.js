import { Box, Flex, OverflowWrapper } from "@/common/components/custom";
import { DATE_FORMATS, ICONS, SELECT_ALL_OPTION, SORTING } from "@/common/constants";
import { getFormatedDate } from "@/common/utils/dates";
import { Label, Popup } from "semantic-ui-react";
import { PriceLabel } from "../../common/components/form";
import { CommentTooltip } from "../../common/components/tooltips";
import { getLabelColor, getPopupContent, isBudgetCancelled, isBudgetConfirmed } from "./budgets.utils";

export const LIST_BUDGETS_QUERY_KEY = 'listAllBudgets';
export const GET_BUDGET_QUERY_KEY = 'getBudget';
export const BUDGETS_FILTERS_KEY = 'budgetsFilters';
export const LIST_ATTRIBUTES = [
  "id",
  "customer",
  "state",
  "products",
  "globalDiscount",
  "additionalCharge",
  "seller",
  "total",
  "confirmedAt",
  "confirmedBy",
  "cancelledAt",
  "cancelledBy",
  "comments"
];

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

export const BUDGETS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    key: "id",
    sortable: true,
    width: 1,
    align: "left",
    value: (budget) => (
      <Box width="60px">
        {isBudgetConfirmed(budget?.state) || isBudgetCancelled(budget?.state) ? (
          <Popup
            trigger={
              <Label ribbon color={getLabelColor(budget)}>
                {budget.id}
              </Label>
            }
            content={getPopupContent(budget)}
            position="right center"
            size="mini"
          />
        ) : (
          <Label ribbon color={getLabelColor(budget)}>
            {budget.id}
          </Label>
        )}
      </Box>
    ),
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
    value: ({ total }) => (
      <PriceLabel value={total} />
    ),
    sortValue: ({ total }) => total ?? 0
  },
  {
    id: 5,
    title: "Vendedor",
    align: "left",
    key: "seller",
    sortable: true,
    width: 4,
    value: (budget) => (
      <OverflowWrapper maxWidth="25vw" popupContent={budget.seller}>
        {budget.seller}
      </OverflowWrapper>
    ),
    sortValue: (budget) => budget.seller ?? ""
  },
];

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

export const EMPTY_FILTERS = { id: '', customer: '', seller: '', state: SELECT_ALL_OPTION.value, sorting: { key: 'id', direction: SORTING.DESC } };
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

export const BUDGET_STATE_TRANSLATIONS = {
  CONFIRMED: BUDGET_STATES.CONFIRMED,
  PENDING: BUDGET_STATES.PENDING,
  EXPIRED: BUDGET_STATES.EXPIRED,
  CANCELLED: BUDGET_STATES.CANCELLED,
  DRAFT: BUDGET_STATES.DRAFT
};
