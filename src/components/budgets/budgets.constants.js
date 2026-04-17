import { Box, Flex, Icon, OverflowWrapper } from "@/common/components/custom";
import { ALL, COLORS, DATE_FORMATS, ICONS, SELECT_ALL_OPTION, SORTING } from "@/common/constants";
import { getLabelColor } from "@/common/utils";
import { getDateWithOffset, getFormatedDate, getStartOfUnit, now } from "@/common/utils/dates";
import { parse } from "date-fns";
import { Label, Popup } from "semantic-ui-react";
import { v4 as uuid } from 'uuid';
import { NumberField, PriceLabel, TextField } from "../../common/components/form";
import { CommentTooltip } from "../../common/components/tooltips";
import { PRODUCT_STATES } from "../products/products.constants";
import { getBudgetListPopupContent, isBudgetCancelled, isBudgetConfirmed } from "./budgets.utils";

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
      href: (budget) => budget.href,
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
                  content={getBudgetListPopupContent(budget)}
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
      href: (budget) => budget.href,
      value: (budget) => (
        <Flex $justifyContent="space-between">
          <OverflowWrapper maxWidth="25vw" popupContent={budget.customer.name}>
            {budget.customer.name}
          </OverflowWrapper>
          {budget.comments && <CommentTooltip $lowTooltip comment={budget.comments} />}
        </Flex>
      ),
      sortValue: (budget) => budget.customer.name ?? ""
    },
    {
      id: 3,
      title: "Fecha",
      key: "date",
      sortable: true,
      whiteSpace: "nowrap",
      width: 1,
      href: (budget) => budget.href,
      value: (budget) => getFormatedDate(budget.createdAt, DATE_FORMATS.DATE_WITH_TIME),
      sortValue: (budget) => budget.createdAt ?? ""
    },
    {
      id: 4,
      title: "Total",
      key: "total",
      sortable: true,
      width: 2,
      href: (budget) => budget.href,
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
        href: (budget) => budget.href,
        value: (budget) => <PriceLabel value={budget.paidAmount ?? 0} />,
        sortValue: (budget) => budget.paidAmount ?? 0
      },
      {
        id: 6,
        title: "Pendiente",
        key: "pendingAmount",
        sortable: true,
        width: 2,
        href: (budget) => budget.href,
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
    id: 7,
    title: "Vendedor",
    align: "left",
    key: "createdBy",
    sortable: true,
    width: isConfirmed ? 4 : 6,
    href: (budget) => budget.href,
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
  { key: 'transferencia', text: 'Transferencia bancaria', value: 'Transferencia bancaria' },
  { key: 'debito', text: 'Tarjeta de débito', value: 'Tarjeta de débito' },
  { key: 'credito', text: 'Tarjeta de crédito', value: 'Tarjeta de crédito' },
  { key: 'mercado_pago', text: 'Mercado pago', value: 'Mercado pago' },
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
export const ADJUST_DELIVERY = "adjust delivery"
export const RETURN = "return"

export const DELIVERY = "delivery"

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

export const PAYMENT_STATES_OPTIONS = [
  SELECT_ALL_OPTION,
  ...Object.values(PAYMENT_STATES).map(({ id, title, color }) => (
    {
      key: id,
      text: (
        <Flex $alignItems="center" $justifyContent="space-between">
          {title}&nbsp;<Label width="fit-content" color={color} circular empty />
        </Flex>
      ),
      value: id,
    }))
];

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
        value: `custom_${range.unit}_${valueNum}`,
        getRange: () => ({
          startDate: parsedDate,
          endDate: new Date(),
        }),
      };
    });
};

export const DATE_RANGE_KEY = "budgets-history-date-range";

export const DEFAULT_DATE_RANGE_VALUE = 3;

export const PAYMENTS_TAB_INDEX = 1;

export const createEmptyBudget = (user) => ({
  createdBy: user?.name,
  customer: null,
  products: [],
  comments: '',
  globalDiscount: 0,
  additionalCharge: 0,
  paymentMethods: [ALL],
  expirationOffsetDays: null,
  paymentsMade: [],
  pickUpInStore: false,
});

export const createClonedBudget = ({
  budget,
  user,
  paymentMethods,
}) => {
  if (!budget) return null;

  return {
    products: budget.products.map(product => ({
      ...product,
      key: uuid(),
      rowId: uuid(),
      quantity:
        product.state === PRODUCT_STATES.OOS.id ? 0 : Number(product.quantity ?? 1),
      discount: Number(product.discount ?? 0),
      price: Number(product.price ?? 0),
      delivered: 0,
      stockFlows: [],
      ...(product.fractionConfig?.active && {
        fractionConfig: {
          ...product.fractionConfig,
          value: product.fractionConfig.value || 1,
          price: product.price,
        },
      }),
    })),
    createdBy: user?.name,
    paymentMethods: paymentMethods.map(({ value }) => value),
    state: BUDGET_STATES.PENDING.id,
    customer: null,
    comments: '',
    globalDiscount: 0,
    additionalCharge: 0,
    expirationOffsetDays: '',
    paymentsMade: [],
    pickUpInStore: false,
  };
};

export const getHourKey = (date) => {
  const d = new Date(date);
  return d.toISOString().slice(0, 13);
};

export const getSecondKey = (date) =>
  new Date(date).toISOString().slice(0, 19);

export const mapStockFlowsToHistory = (stockFlows = []) => {
  const grouped = {};

  for (const flow of stockFlows) {
    const secondKey = getSecondKey(flow.date);

    const groupKey = `${secondKey}-${flow.inflow}-${flow.deliveryNote ?? "-"}`;

    if (!grouped[groupKey]) {
      grouped[groupKey] = {
        id: groupKey,
        date: flow.date,
        inflow: flow.inflow,
        deliveryNote: flow.deliveryNote ?? null,
        createdBy: flow.createdBy,
        rows: [],
      };
    }

    grouped[groupKey].rows.push({
      productId: flow.productId,
      productName: flow.productName,
      quantity: flow.quantity,
      comments: flow.comments,
      dispatchComment: flow.dispatchComment
    });
  }

  return Object.values(grouped).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
};

export const getDeliveryStats = (product) => {
  const quantity = Number(product?.quantity ?? 0);
  const delivered = Number(product?.delivered ?? 0);
  const pending = Math.max(quantity - delivered, 0);

  return {
    quantity,
    delivered,
    pending,
    isCompleted: pending === 0 && quantity > 0,
  };
};

export const hasInvalidStockQuantities = ({
  products,
  quantities,
  mode,
}) => {
  return products.some(product => {
    const entered = Number(quantities[product.rowId] ?? 0);
    if (entered <= 0) return false;

    const { delivered, pending } = getDeliveryStats(product);

    if (mode === DELIVERY) return entered > pending;
    if (mode === RETURN) return entered > delivered;

    return false;
  });
};

export const buildBudgetDeliveriesColumns = ({
  create,
  setValue,
}) => {
  const columns = [
    {
      id: 1,
      title: "ID",
      key: "id",
      sortable: true,
      value: (product) => {
        const { isCompleted } = getDeliveryStats(product);
        return (
          <Flex $justifyContent="space-between">
            {product.id}
            {isCompleted && (
              <Popup
                trigger={
                  <Flex $alignItems="center" >
                    {isCompleted && (
                      <Icon
                        $lowTooltip
                        name={ICONS.CHECK}
                        color={COLORS.GREEN}
                      />
                    )}
                  </Flex>
                }
                content="Entrega completa"
                position="right center"
                size="mini"
              />
            )}
          </Flex>
        );
      },
      width: 1,
    },
    {
      id: 2,
      key: "name",
      sortable: true,
      title: "Producto",
      value: (product) => product.name,
      sortValue: (product) => product.name ?? "",
      width: 6,
    },
    {
      id: 3,
      key: "quantity",
      sortable: true,
      title: "Cantidad",
      value: (product) => product.quantity,
      sortValue: (product) => Number(product.quantity),
      width: 2,
    },
    {
      id: 4,
      key: "delivered",
      sortable: true,
      title: "Entregado",
      value: (product, index) => {
        if (!create) {
          const { delivered } = getDeliveryStats(product);
          return delivered;
        }

        return (
          <Box width="150px">
            <NumberField
              width="100%"
              padding="9.5px 14px"
              min={0}
              max={product.quantity ?? 0}
              value={product.delivered ?? 0}
              onChange={(v) =>
                setValue(`products.${index}.delivered`, Number(v ?? 0), {
                  shouldDirty: true,
                })
              }
            />
          </Box>
        );
      },
      sortValue: (product) => getDeliveryStats(product).delivered,
      width: 1,
    },
    {
      id: 5,
      key: "pending",
      sortable: true,
      title: "Pendiente",
      value: (product) => {
        const { pending } = getDeliveryStats(product);
        return pending;
      },
      sortValue: (product) => getDeliveryStats(product).pending,
      width: 2,
    },
  ];
  if (create) {
    columns.push({
      id: 6,
      key: "comments",
      title: "Comentarios",
      value: (product, index) => (
        <TextField
          placeholder="Entrega parcial"
          onChange={(e) =>
            setValue(
              `products.${index}.comments`,
              e.target.value,
              { shouldDirty: true }
            )
          }
        />
      ),
      width: 2,
    });
  }

  return columns;
};

export const buildConsumeStockFlows = (products = []) => {
  return products
    .filter(p => Number(p.delivered ?? 0) > 0)
    .map(p => ({
      productId: p.id,
      rowId: p.rowId,
      quantity: Number(p.delivered),
      comments: p.deliveryComment?.trim() || undefined,
      date: new Date().toISOString(),
      stockControl: p.stockControl ?? true,
      dispatchComment: p.dispatchComment
    }));
};

export const mapBudgetToDeliveryForm = (budget) => ({
  products: budget.products.map(p => ({
    ...p,
    delivered: p.delivered ?? 0,
    deliveryComment: p.deliveryComment ?? "",
  })),
  DeliveriesHistory: (budget.stockFlows ?? []).map(flow => ({
    id: flow.id,
    productId: flow.productId,
    rowId: flow.rowId,
    quantity: flow.quantity,
    inflow: flow.inflow,
    date: flow.date,
    createdBy: flow.createdBy,
  })),
});