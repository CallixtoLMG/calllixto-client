import { Box, Flex, OverflowWrapper } from "@/common/components/custom";
import { DATE_FORMATS, ICONS, SELECT_ALL_OPTION } from "@/common/constants";
import { getFormatedDate } from "@/common/utils/dates";
import { Label, Popup } from "semantic-ui-react";
import { PriceLabel } from "../../common/components/form";
import { CommentTooltip } from "../../common/components/tooltips";
import { getLabelColor, getPopupContent, getTotalSum, isBudgetCancelled, isBudgetConfirmed } from "./budgets.utils";

export const LIST_BUDGETS_QUERY_KEY = 'listAllBudgets';
export const GET_BUDGET_QUERY_KEY = 'getBudget';
export const BUDGETS_FILTERS_KEY = 'budgetsFilters';

export const ATTRIBUTES = {
  ID: "id",
  CUSTOMER: "customer",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  CONFIRMED: "confirmed",
  SELLER: "seller",
  PRODUCTS: "products",
  DISCOUNT: "globalDiscount",
  STATE: "state",
  ADDITIONAL_CHARGE: "additionalCharge",
  PAYMENT_METHODS: "paymentMethods",
  PAYMENTS_MADE: "paymentsMade",
  EXPIRATION_OFF_SET_DAYS: "expirationOffsetDays",
  PICKUP_IN_STORE: "pickUpInStore",
  TOTAL: "total",
  CONFIRMED_AT: "confirmedAt",
  CONFIRMED_BY: "confirmedBy",
  CANCELLED_AT: "cancelledAt",
  CANCELLED_BY: "cancelledBy",
  COMMENTS: "comments"
};

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
    )
  },
  {
    id: 2,
    title: "Cliente",
    align: "left",
    width: 6,
    value: (budget) => (
      <Flex $justifyContent="space-between">
        <OverflowWrapper maxWidth="25vw" popupContent={budget.customer.name}>
          {budget.customer.name}
        </OverflowWrapper>
        {budget.comments && <CommentTooltip comment={budget.comments} />}
      </Flex>
    )
  },
  {
    id: 3,
    title: "Fecha",
    width: 3,
    value: (budget) => getFormatedDate(budget.createdAt, DATE_FORMATS.DATE_WITH_TIME)
  },
  {
    id: 4,
    title: "Total",
    width: 2,
    value: (budget) => (
      <PriceLabel value={getTotalSum(budget.products, budget.globalDiscount, budget.additionalCharge)} />
    )
  },
  {
    id: 5,
    title: "Vendedor",
    align: "left",
    width: 4,
    value: (budget) => (
      <OverflowWrapper maxWidth="25vw" popupContent={budget.seller}>
        {budget.seller}
      </OverflowWrapper>
    )
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

export const PAYMENT_TABLE_HEADERS = [
  {
    id: 'date',
    title: 'Fecha de Pago',
    value: (element) =>
      element.date
        ? getFormatedDate(element.date)
        : "-",
    width: 2
  },
  { id: 'method', width: 4, title: 'Método', value: (element) => element.method },
  { id: 'amount', width: 3, title: 'Monto', value: (element) => <PriceLabel value={element.amount} /> },
  {
    id: 'comments', width: 9, align: "left", title: 'Comentarios', value: (element) =>
      <OverflowWrapper maxWidth="30vw" popupContent={element.comments}> {element.comments} </OverflowWrapper>
  },
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

export const EMPTY_FILTERS = { id: '', customer: '', seller: '', state: SELECT_ALL_OPTION.value };
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
