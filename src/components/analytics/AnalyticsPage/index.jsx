"use client";

import {
  useAnalyticsExpenseCategoryDetails,
  useAnalyticsExpenses,
  useAnalyticsOverview,
  useAnalyticsSalesRanking,
  useAnalyticsSalesTimeseries,
  useAnalyticsTopProducts,
} from "@/api/analytics";
import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, Icon, OverflowWrapper } from "@/common/components/custom";
import { Table } from "@/common/components/table";
import { IconTooltip } from "@/common/components/tooltips";
import { Loader } from "@/components/layout/Loader";
import { COLORS, ICONS, SIZES } from "@/common/constants";
import { getFormatedPrice } from "@/common/utils";
import {
  ANALYTICS_MOCK_STATES,
  ANALYTICS_PRESETS,
  ANALYTICS_PRESET_OPTIONS,
  ANALYTICS_SALES_RANKING_DIMENSIONS,
  ANALYTICS_SALES_RANKING_OPTIONS,
  ANALYTICS_TAB_OPTIONS,
} from "@/components/analytics/analytics.constants";
import {
  analyticsExpenseKpiConfig,
  analyticsGroupByLabels,
  analyticsSalesKpiConfig,
  analyticsSummaryKpiConfig,
  areSameRange,
  formatCategoryName,
  formatBucketLabel,
  formatDateRange,
  formatFullDate,
  formatPercent,
  formatXAxisLabel,
  getAnalyticsRangeDayCount,
  getBusinessTodayValue,
  getChartTooltipPosition,
  getComparisonRange,
  getPresetRange,
  getXAxisLabelIndexes,
  SALES_CHART_CONFIG,
  isValidRange,
} from "@/components/analytics/analytics.utils";
import { useMemo, useState } from "react";
import { Modal, Tab, Transition } from "semantic-ui-react";
import Kpis from "./Kpis";
import RevenueRankingList from "./RevenueRankingList";
import SalesChart from "./SalesChart";
import SectionState from "./SectionState";
import {
  AnalyticsTabs,
  BarFill,
  BarTrack,
  CategoryAmountGroup,
  ChartLegend,
  ChartTooltipTarget,
  ChartWrap,
  DateInput,
  DetailCloseButton,
  DetailModal,
  DetailModalHeader,
  DetailModalSummary,
  DetailModalTitle,
  DetailNameCell,
  DetailTableWrap,
  ExpenseSummary,
  ExpenseSummaryItem,
  ExpenseCategoryItem,
  Eyebrow,
  Field,
  FiltersGrid,
  HeaderPanel,
  HighlightAmount,
  HighlightGrid,
  HighlightItem,
  HighlightLabel,
  HighlightMeta,
  HighlightTitle,
  LegendItem,
  MainChartBody,
  Page,
  Panel,
  PanelBody,
  PanelDescription,
  PanelHeader,
  PanelHeaderGroup,
  PanelMeta,
  PanelTitle,
  PanelTitleInline,
  RankedAmount,
  RankedList,
  RankedMeta,
  RankedName,
  RankingBody,
  SegmentButton,
  SegmentedControl,
  Select,
  StateBox,
  Subtitle,
  SummaryLabel,
  SummaryValue,
  TabContent,
  Title,
  TitleGroup,
} from "./styles";

const ExpenseCategoryDetailsModal = ({ category, range, mockState, open, onClose }) => {
  const details = useAnalyticsExpenseCategoryDetails({
    category: category?.name,
    range,
    mockState,
    enabled: open,
  });
  const modalTotal = details.data?.total ?? category?.amount ?? 0;
  const items = details.data?.items ?? [];
  const detailHeaders = useMemo(() => [
    {
      id: "name",
      key: "name",
      title: "Nombre",
      width: "44%",
      align: "left",
      value: (item) => (
        <DetailNameCell>
          <OverflowWrapper maxWidth="100%" popupContent={item.name}>
            {item.name}
          </OverflowWrapper>
        </DetailNameCell>
      ),
    },
    {
      id: "date",
      key: "date",
      title: "Fecha",
      width: "118px",
      align: "right",
      value: (item) => formatFullDate(item.date),
    },
    {
      id: "amount",
      key: "amount",
      title: "Total",
      width: "124px",
      align: "right",
      value: (item) => getFormatedPrice(item.amount),
    },
    {
      id: "paidAmount",
      key: "paidAmount",
      title: "Pagado",
      width: "124px",
      align: "right",
      value: (item) => getFormatedPrice(item.paidAmount),
    },
    {
      id: "pendingAmount",
      key: "pendingAmount",
      title: "Pendiente",
      width: "124px",
      align: "right",
      value: (item) => getFormatedPrice(item.pendingAmount),
    },
    {
      id: "state",
      key: "state",
      title: "Estado",
      width: "112px",
      align: "right",
      value: (item) => item.stateLabel ?? item.state,
    },
  ], []);

  return (
    <Transition visible={open} animation="scale" duration={500}>
      <DetailModal
        open={open}
        onClose={onClose}
        size={SIZES.LARGE}
        width="980px"
        aria-labelledby="expense-category-details-title"
      >
        <DetailModalHeader>
          <DetailModalTitle id="expense-category-details-title">
            Gastos de {formatCategoryName(category?.name)}
          </DetailModalTitle>
          <DetailModalSummary>
            Total de la categoría: {getFormatedPrice(modalTotal)}
          </DetailModalSummary>
          <DetailCloseButton type="button" aria-label="Cerrar detalle de gastos" onClick={onClose}>
            <Icon name={ICONS.TIMES} />
          </DetailCloseButton>
        </DetailModalHeader>
        <Modal.Content scrolling>
          <SectionState
            isLoading={details.isLoading}
            error={details.error}
            empty={!items.length}
            emptyMessage="No hay gastos para esta categoría en el período."
          >
            <DetailTableWrap>
              <Table
                headers={detailHeaders}
                elements={items}
                mainKey="id"
              />
            </DetailTableWrap>
          </SectionState>
        </Modal.Content>
        <Modal.Actions>
          <ButtonsContainer>
            <IconedButton
              text="Cerrar"
              icon={ICONS.TIMES}
              color={COLORS.RED}
              onClick={onClose}
            />
          </ButtonsContainer>
        </Modal.Actions>
      </DetailModal>
    </Transition>
  );
};

const ExpensesByCategory = ({ data, isLoading, error, range, mockState, categoryLimit }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const hasExpensesData = !!data;
  const categories = hasExpensesData ? data.categories : [];
  const visibleCategories = categoryLimit ? categories.slice(0, categoryLimit) : categories;
  const maxAmount = Math.max(1, ...categories.map(({ amount }) => Math.abs(amount)));
  const hasCategories = visibleCategories.length > 0;
  const showState = isLoading || error || !hasExpensesData || !hasCategories;
  const closeCategoryDetails = () => setSelectedCategory(null);

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Gastos por categoría</PanelTitle>
        <PanelMeta>{hasExpensesData && data.total ? getFormatedPrice(data.total) : ""}</PanelMeta>
      </PanelHeader>
      <PanelBody>
        {showState ? (
          <SectionState
            isLoading={isLoading}
            error={error}
            empty={!hasExpensesData || !hasCategories}
            emptyMessage="No hay gastos registrados para este período."
          />
        ) : (
          <>
            <ExpenseSummary>
              <ExpenseSummaryItem>
                <SummaryLabel>Total</SummaryLabel>
                <SummaryValue>{getFormatedPrice(data.total)}</SummaryValue>
              </ExpenseSummaryItem>
              <ExpenseSummaryItem>
                <SummaryLabel>Pagado</SummaryLabel>
                <SummaryValue>{getFormatedPrice(data.paidAmount)}</SummaryValue>
              </ExpenseSummaryItem>
              <ExpenseSummaryItem>
                <SummaryLabel>Pendiente</SummaryLabel>
                <SummaryValue>{getFormatedPrice(data.pendingAmount)}</SummaryValue>
              </ExpenseSummaryItem>
            </ExpenseSummary>
            <RankedList>
              {visibleCategories.map((category) => (
                <ExpenseCategoryItem
                  key={category.name}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-label={`Ver gastos de ${category.name}`}
                >
                  <div>
                    <RankedName>
                      <OverflowWrapper maxWidth="100%" popupContent={category.name}>
                        {category.name}
                      </OverflowWrapper>
                    </RankedName>
                    <RankedMeta>Importe neto · {formatPercent(category.sharePct)}</RankedMeta>
                  </div>
                  <CategoryAmountGroup>
                    <RankedAmount>{getFormatedPrice(category.amount)}</RankedAmount>
                    <Icon name={ICONS.CHEVRON_RIGHT} color={COLORS.BLUE} />
                  </CategoryAmountGroup>
                  <BarTrack>
                    <BarFill $variant="expense" $width={(Math.abs(category.amount) / maxAmount) * 100} />
                  </BarTrack>
                </ExpenseCategoryItem>
              ))}
            </RankedList>
            <ExpenseCategoryDetailsModal
              category={selectedCategory}
              range={range}
              mockState={mockState}
              open={!!selectedCategory}
              onClose={closeCategoryDetails}
            />
          </>
        )}
      </PanelBody>
    </Panel>
  );
};

const ExpenseComposition = ({ data, isLoading, error }) => {
  const composition = data?.composition;

  return (
    <Panel>
      <PanelHeader>
        <PanelHeaderGroup>
          <PanelTitle>Composición de gastos</PanelTitle>
          <PanelDescription>Gastos registrados menos anulaciones registradas en el período.</PanelDescription>
        </PanelHeaderGroup>
      </PanelHeader>
      <PanelBody>
        <SectionState
          isLoading={isLoading}
          error={error}
          empty={!composition}
          emptyMessage="No hay composición de gastos para este período."
        >
          <ExpenseSummary>
            <ExpenseSummaryItem>
              <SummaryLabel>Gastos registrados</SummaryLabel>
              <SummaryValue>{getFormatedPrice(composition?.registeredAmount ?? 0)}</SummaryValue>
            </ExpenseSummaryItem>
            <ExpenseSummaryItem>
              <SummaryLabel>Anulaciones</SummaryLabel>
              <SummaryValue>
                {composition?.cancellationsAmount ? `-${getFormatedPrice(composition.cancellationsAmount)}` : getFormatedPrice(0)}
              </SummaryValue>
            </ExpenseSummaryItem>
            <ExpenseSummaryItem>
              <SummaryLabel>Gasto neto</SummaryLabel>
              <SummaryValue>{getFormatedPrice(composition?.netExpense ?? 0)}</SummaryValue>
            </ExpenseSummaryItem>
          </ExpenseSummary>
        </SectionState>
      </PanelBody>
    </Panel>
  );
};

const getExpensePolylinePoints = ({ coordinates }) =>
  coordinates.map(({ x, y }) => `${x},${y}`).join(" ");

const getExpenseChartCoordinates = ({ points, valueKey, minValue, maxValue, width, height, padding }) => {
  if (!points.length) return [];

  const valueRange = Math.max(1, maxValue - minValue);
  const xStep = points.length === 1 ? 0 : (width - padding.left - padding.right) / (points.length - 1);

  return points.map((point, index) => {
    const value = Number(point[valueKey] ?? 0);

    return {
      ...point,
      x: padding.left + (xStep * index),
      y: padding.top + ((maxValue - value) / valueRange) * (height - padding.top - padding.bottom),
    };
  });
};

const ExpensesChart = ({ data, isLoading, error }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const points = data?.timeseries ?? [];
  const groupBy = data?.groupBy ?? "day";
  const isEmpty = !points.some(({ registeredAmount, cancellationsAmount, netExpense }) =>
    registeredAmount > 0 || cancellationsAmount > 0 || netExpense !== 0
  );
  const { width, height, padding, gridValues } = SALES_CHART_CONFIG;
  const values = points.flatMap(({ registeredAmount, cancellationsAmount, netExpense }) => [
    registeredAmount,
    cancellationsAmount,
    netExpense,
  ]);
  const maxValue = Math.max(1, ...values);
  const minValue = Math.min(0, ...values);
  const registeredCoordinates = getExpenseChartCoordinates({ points, valueKey: "registeredAmount", minValue, maxValue, width, height, padding });
  const cancellationsCoordinates = getExpenseChartCoordinates({ points, valueKey: "cancellationsAmount", minValue, maxValue, width, height, padding });
  const netCoordinates = getExpenseChartCoordinates({ points, valueKey: "netExpense", minValue, maxValue, width, height, padding });
  const xAxisLabelIndexes = getXAxisLabelIndexes(points);
  const hoveredTooltip = hoveredPoint ? getChartTooltipPosition({ point: hoveredPoint, width, height }) : null;

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Evolución de gastos</PanelTitle>
        <PanelMeta>{analyticsGroupByLabels[groupBy] ?? groupBy}</PanelMeta>
      </PanelHeader>
      <MainChartBody>
        <SectionState
          isLoading={isLoading}
          error={error}
          empty={isEmpty}
          emptyMessage="Todavía no hay gastos para graficar en este período."
        >
          <ChartWrap>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolución de gastos">
              <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
              {gridValues.map((ratio) => {
                const value = minValue + ((maxValue - minValue) * ratio);
                const y = padding.top + ((maxValue - value) / Math.max(1, maxValue - minValue)) * (height - padding.top - padding.bottom);

                return (
                  <g key={ratio}>
                    <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e7edf3" strokeWidth="1" />
                    <text x="16" y={y + 4} fill="#7b8794" fontSize="12" fontWeight="700">
                      {`$${Math.round(value / 1000)}k`}
                    </text>
                  </g>
                );
              })}
              {points.map((point, index) => {
                if (!xAxisLabelIndexes.has(index)) return null;
                const x = netCoordinates[index]?.x ?? padding.left;

                return (
                  <text key={point.periodStart} x={x} y={height - 13} textAnchor="middle" fill="#7b8794" fontSize="12" fontWeight="700">
                    {formatXAxisLabel(point, groupBy)}
                  </text>
                );
              })}
              <polyline points={getExpensePolylinePoints({ coordinates: registeredCoordinates })} fill="none" stroke="#2185d0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={getExpensePolylinePoints({ coordinates: cancellationsCoordinates })} fill="none" stroke="#98a2b3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="9 9" />
              <polyline points={getExpensePolylinePoints({ coordinates: netCoordinates })} fill="none" stroke="#5f6c7b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              {netCoordinates.map((point) => (
                <ChartTooltipTarget
                  key={`expense_tooltip_${point.periodStart}`}
                  cx={point.x}
                  cy={point.y}
                  r="13"
                  fill="transparent"
                  stroke="transparent"
                  tabIndex={0}
                  data-expense-tooltip-date={point.periodStart}
                  data-expense-tooltip-registered={point.registeredAmount}
                  data-expense-tooltip-cancellations={point.cancellationsAmount}
                  data-expense-tooltip-net={point.netExpense}
                  onFocus={() => setHoveredPoint(point)}
                  onBlur={() => setHoveredPoint(null)}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
              {hoveredPoint && hoveredTooltip && (
                <g pointerEvents="none">
                  <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="7" fill="#5f6c7b" stroke="#ffffff" strokeWidth="3" />
                  <rect
                    x={hoveredTooltip.x}
                    y={hoveredTooltip.y}
                    width={hoveredTooltip.width}
                    height="92"
                    rx="6"
                    fill="#111827"
                    opacity="0.94"
                  />
                  <text x={hoveredTooltip.x + 12} y={hoveredTooltip.y + 20} fill="#ffffff" fontSize="12" fontWeight="800">
                    {formatBucketLabel(hoveredPoint, groupBy)}
                  </text>
                  <text x={hoveredTooltip.x + 12} y={hoveredTooltip.y + 40} fill="#ffffff" fontSize="12">
                    {`Registrados: ${getFormatedPrice(hoveredPoint.registeredAmount)}`}
                  </text>
                  <text x={hoveredTooltip.x + 12} y={hoveredTooltip.y + 60} fill="#ffffff" fontSize="12">
                    {`Anulaciones: ${getFormatedPrice(hoveredPoint.cancellationsAmount)}`}
                  </text>
                  <text x={hoveredTooltip.x + 12} y={hoveredTooltip.y + 80} fill="#ffffff" fontSize="12">
                    {`Gasto neto: ${getFormatedPrice(hoveredPoint.netExpense)}`}
                  </text>
                </g>
              )}
            </svg>
          </ChartWrap>
          <ChartLegend>
            <LegendItem>Registrados</LegendItem>
            <LegendItem $muted>Anulaciones</LegendItem>
            <LegendItem $expense>Gasto neto</LegendItem>
          </ChartLegend>
        </SectionState>
      </MainChartBody>
    </Panel>
  );
};

const buildBusinessEvolutionPoints = ({ salesTimeseries, expenses }) => {
  const salesPoints = salesTimeseries?.current ?? [];
  const expensePoints = expenses?.timeseries ?? [];
  const expensesByBucket = new Map(expensePoints.map((point) => [point.periodStart, point]));
  const basePoints = salesPoints.length ? salesPoints : expensePoints;

  return basePoints.map((point, index) => {
    const expensePoint = expensesByBucket.get(point.periodStart) ?? expensePoints[index] ?? {};

    return {
      periodEnd: point.periodEnd ?? expensePoint.periodEnd,
      periodLabel: point.periodLabel ?? expensePoint.periodLabel,
      periodStart: point.periodStart,
      netSales: point.netSales ?? 0,
      netExpense: expensePoint.netExpense ?? 0,
    };
  });
};

const BusinessEvolutionChart = ({ salesTimeseries, expenses, isLoading, error }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const points = buildBusinessEvolutionPoints({ salesTimeseries, expenses });
  const groupBy = salesTimeseries?.groupBy ?? expenses?.groupBy ?? "day";
  const isEmpty = !points.some(({ netSales, netExpense }) => netSales !== 0 || netExpense !== 0);
  const { width, height, padding, gridValues } = SALES_CHART_CONFIG;
  const values = points.flatMap(({ netSales, netExpense }) => [netSales, netExpense]);
  const maxValue = Math.max(1, ...values);
  const minValue = Math.min(0, ...values);
  const salesCoordinates = getExpenseChartCoordinates({ points, valueKey: "netSales", minValue, maxValue, width, height, padding });
  const expenseCoordinates = getExpenseChartCoordinates({ points, valueKey: "netExpense", minValue, maxValue, width, height, padding });
  const xAxisLabelIndexes = getXAxisLabelIndexes(points);
  const hoveredTooltip = hoveredPoint
    ? getChartTooltipPosition({ point: { ...hoveredPoint, previous: {} }, width, height })
    : null;

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Evolución del negocio</PanelTitle>
        <PanelMeta>{analyticsGroupByLabels[groupBy] ?? groupBy}</PanelMeta>
      </PanelHeader>
      <MainChartBody>
        <SectionState
          isLoading={isLoading}
          error={error}
          empty={isEmpty}
          emptyMessage="Todavía no hay ventas ni gastos para graficar en este período."
        >
          <ChartWrap>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolución del negocio">
              <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
              {gridValues.map((ratio) => {
                const value = minValue + ((maxValue - minValue) * ratio);
                const y = padding.top + ((maxValue - value) / Math.max(1, maxValue - minValue)) * (height - padding.top - padding.bottom);

                return (
                  <g key={ratio}>
                    <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e7edf3" strokeWidth="1" />
                    <text x="16" y={y + 4} fill="#7b8794" fontSize="12" fontWeight="700">
                      {`$${Math.round(value / 1000)}k`}
                    </text>
                  </g>
                );
              })}
              {points.map((point, index) => {
                if (!xAxisLabelIndexes.has(index)) return null;
                const x = salesCoordinates[index]?.x ?? padding.left;

                return (
                  <text key={point.periodStart} x={x} y={height - 13} textAnchor="middle" fill="#7b8794" fontSize="12" fontWeight="700">
                    {formatXAxisLabel(point, groupBy)}
                  </text>
                );
              })}
              <polyline points={getExpensePolylinePoints({ coordinates: salesCoordinates })} fill="none" stroke="#2185d0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={getExpensePolylinePoints({ coordinates: expenseCoordinates })} fill="none" stroke="#5f6c7b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              {salesCoordinates.map((point, index) => {
                const expensePoint = expenseCoordinates[index];
                const tooltipPoint = {
                  ...point,
                  netExpense: expensePoint?.netExpense ?? 0,
                };

                return (
                  <ChartTooltipTarget
                    key={`business_tooltip_${point.periodStart}`}
                    cx={point.x}
                    cy={point.y}
                    r="13"
                    fill="transparent"
                    stroke="transparent"
                    tabIndex={0}
                    data-business-tooltip-date={point.periodStart}
                    data-business-tooltip-sales={point.netSales}
                    data-business-tooltip-expense={tooltipPoint.netExpense}
                    onFocus={() => setHoveredPoint(tooltipPoint)}
                    onBlur={() => setHoveredPoint(null)}
                    onMouseEnter={() => setHoveredPoint(tooltipPoint)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
              {hoveredPoint && hoveredTooltip && (
                <g pointerEvents="none">
                  <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="7" fill="#2185d0" stroke="#ffffff" strokeWidth="3" />
                  <rect
                    x={hoveredTooltip.x}
                    y={hoveredTooltip.y}
                    width={hoveredTooltip.width}
                    height={hoveredTooltip.height}
                    rx="6"
                    fill="#111827"
                    opacity="0.94"
                  />
                  <text x={hoveredTooltip.x + 12} y={hoveredTooltip.y + 20} fill="#ffffff" fontSize="12" fontWeight="800">
                    {formatBucketLabel(hoveredPoint, groupBy)}
                  </text>
                  <text x={hoveredTooltip.x + 12} y={hoveredTooltip.y + 40} fill="#ffffff" fontSize="12">
                    {`Ventas netas: ${getFormatedPrice(hoveredPoint.netSales)}`}
                  </text>
                  <text x={hoveredTooltip.x + 12} y={hoveredTooltip.y + 60} fill="#ffffff" fontSize="12">
                    {`Gasto neto: ${getFormatedPrice(hoveredPoint.netExpense)}`}
                  </text>
                </g>
              )}
            </svg>
          </ChartWrap>
          <ChartLegend>
            <LegendItem>Ventas netas</LegendItem>
            <LegendItem $expense>Gasto neto</LegendItem>
          </ChartLegend>
        </SectionState>
      </MainChartBody>
    </Panel>
  );
};

const SummaryHighlights = ({ topProducts, expenses }) => {
  const leadingProduct = topProducts?.items?.[0];
  const leadingExpenseCategory = expenses?.categories?.[0];

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Highlights del período</PanelTitle>
      </PanelHeader>
      <PanelBody>
        <HighlightGrid>
          <HighlightItem>
            <HighlightLabel>Producto líder</HighlightLabel>
            <HighlightTitle>
              {leadingProduct ? (
                <OverflowWrapper maxWidth="100%" popupContent={leadingProduct.name}>
                  {leadingProduct.name}
                </OverflowWrapper>
              ) : "Sin producto líder"}
            </HighlightTitle>
            {leadingProduct?.brandName && <HighlightMeta>{leadingProduct.brandName}</HighlightMeta>}
            <HighlightAmount>{getFormatedPrice(leadingProduct?.revenue ?? 0)}</HighlightAmount>
          </HighlightItem>
          <HighlightItem>
            <HighlightLabel>Principal categoría de gasto</HighlightLabel>
            <HighlightTitle>
              {leadingExpenseCategory ? (
                <OverflowWrapper maxWidth="100%" popupContent={leadingExpenseCategory.name}>
                  {leadingExpenseCategory.name}
                </OverflowWrapper>
              ) : "Sin categoría principal"}
            </HighlightTitle>
            <HighlightMeta>Importe neto</HighlightMeta>
            <HighlightAmount>{getFormatedPrice(leadingExpenseCategory?.amount ?? 0)}</HighlightAmount>
          </HighlightItem>
        </HighlightGrid>
      </PanelBody>
    </Panel>
  );
};

const SummaryPane = ({
  overview,
  salesTimeseries,
  topProducts,
  expenses,
  isGlobalEmpty,
}) => (
  <TabContent>
    {isGlobalEmpty ? (
      <Panel>
        <StateBox>No hay datos para este período</StateBox>
      </Panel>
    ) : (
      <>
        <Kpis
          overview={overview.data}
          isLoading={overview.isLoading}
          error={overview.error}
          config={analyticsSummaryKpiConfig}
        />

        <BusinessEvolutionChart
          salesTimeseries={salesTimeseries.data}
          expenses={expenses.data}
          isLoading={salesTimeseries.isLoading || expenses.isLoading}
          error={salesTimeseries.error || expenses.error}
        />

        <SectionState
          isLoading={topProducts.isLoading || expenses.isLoading}
          error={topProducts.error || expenses.error}
          empty={!topProducts.data && !expenses.data}
          emptyMessage="No hay highlights para este período."
        >
          <SummaryHighlights topProducts={topProducts.data} expenses={expenses.data} />
        </SectionState>
      </>
    )}
  </TabContent>
);

const rankingDimensionMeta = {
  [ANALYTICS_SALES_RANKING_DIMENSIONS.PRODUCTS]: {
    empty: "No hay productos con facturación para este período.",
    getKey: (item) => item.productId,
    getName: (item) => item.name,
    getMeta: (item) => `${item.brandName} · ${item.commercialQuantity} unidades`,
  },
  [ANALYTICS_SALES_RANKING_DIMENSIONS.BRANDS]: {
    empty: "No hay marcas con facturación para este período.",
    getKey: (item) => item.id,
    getName: (item) => item.name,
  },
  [ANALYTICS_SALES_RANKING_DIMENSIONS.SUPPLIERS]: {
    tooltip: "Facturación generada por productos asociados a cada proveedor.",
    empty: "No hay proveedores con facturación para este período.",
    getKey: (item) => item.id,
    getName: (item) => item.name,
  },
};

const SalesRanking = ({ range, mockState }) => {
  const [dimension, setDimension] = useState(ANALYTICS_SALES_RANKING_DIMENSIONS.PRODUCTS);
  const ranking = useAnalyticsSalesRanking({ range, dimension, mockState });
  const items = ranking.data?.items ?? [];
  const dimensionConfig = rankingDimensionMeta[dimension];

  return (
    <Panel>
      <PanelHeader>
        <PanelHeaderGroup>
          <PanelTitle>
            <PanelTitleInline>
              <span>Ranking por facturación</span>
              {dimensionConfig.tooltip && (
                <IconTooltip
                  ariaLabel="Información: Ranking por facturación"
                  color={COLORS.BLUE}
                  content={dimensionConfig.tooltip}
                  icon={ICONS.INFO_CIRCLE}
                />
              )}
            </PanelTitleInline>
          </PanelTitle>
        </PanelHeaderGroup>
        <SegmentedControl aria-label="Dimensión del ranking de ventas">
          {ANALYTICS_SALES_RANKING_OPTIONS.map((option) => (
            <SegmentButton
              key={option.key}
              type="button"
              $active={dimension === option.key}
              aria-pressed={dimension === option.key}
              onClick={() => setDimension(option.key)}
            >
              {option.label}
            </SegmentButton>
          ))}
        </SegmentedControl>
      </PanelHeader>
      <PanelBody>
        <RankingBody>
          <Loader active={ranking.isLoading} message="Cargando ranking...">
            <SectionState
              error={ranking.error}
              empty={!items.length}
              emptyMessage={dimensionConfig.empty}
            >
              <RevenueRankingList
                items={items}
                getKey={dimensionConfig.getKey}
                getName={dimensionConfig.getName}
                getMeta={dimensionConfig.getMeta}
              />
            </SectionState>
          </Loader>
        </RankingBody>
      </PanelBody>
    </Panel>
  );
};

const SalesNetComposition = ({ overview, isLoading, error }) => {
  const composition = overview?.salesComposition;

  return (
    <Panel>
      <PanelHeader>
        <PanelHeaderGroup>
          <PanelTitle>Composición de ventas netas</PanelTitle>
          <PanelDescription>Ventas confirmadas menos cancelaciones registradas en el período.</PanelDescription>
        </PanelHeaderGroup>
      </PanelHeader>
      <PanelBody>
        <SectionState
          isLoading={isLoading}
          error={error}
          empty={!composition}
          emptyMessage="No hay composición de ventas para este período."
        >
          <ExpenseSummary>
            <ExpenseSummaryItem>
              <SummaryLabel>Ventas confirmadas</SummaryLabel>
              <SummaryValue>{getFormatedPrice(composition?.confirmedSales ?? 0)}</SummaryValue>
            </ExpenseSummaryItem>
            <ExpenseSummaryItem>
              <SummaryLabel>Cancelaciones</SummaryLabel>
              <SummaryValue>
                {composition?.cancellations ? `-${getFormatedPrice(composition.cancellations)}` : getFormatedPrice(0)}
              </SummaryValue>
            </ExpenseSummaryItem>
            <ExpenseSummaryItem>
              <SummaryLabel>Ventas netas</SummaryLabel>
              <SummaryValue>{getFormatedPrice(composition?.netSales ?? 0)}</SummaryValue>
            </ExpenseSummaryItem>
          </ExpenseSummary>
        </SectionState>
      </PanelBody>
    </Panel>
  );
};

const SalesPane = ({ overview, salesTimeseries, appliedRange, mockState }) => (
  <TabContent>
    <Kpis
      overview={overview.data}
      isLoading={overview.isLoading}
      error={overview.error}
      config={analyticsSalesKpiConfig}
    />
    <SalesNetComposition
      overview={overview.data}
      isLoading={overview.isLoading}
      error={overview.error}
    />
    <SalesChart
      data={salesTimeseries.data}
      isLoading={salesTimeseries.isLoading}
      error={salesTimeseries.error}
    />
    <SalesRanking range={appliedRange} mockState={mockState} />
  </TabContent>
);

const ExpensesPane = ({ expenses, appliedRange, mockState }) => (
  <TabContent>
    <Kpis
      overview={expenses.data}
      isLoading={expenses.isLoading}
      error={expenses.error}
      config={analyticsExpenseKpiConfig}
    />
    <ExpenseComposition
      data={expenses.data}
      isLoading={expenses.isLoading}
      error={expenses.error}
    />
    <ExpensesChart
      data={expenses.data}
      isLoading={expenses.isLoading}
      error={expenses.error}
    />
    <ExpensesByCategory
      data={expenses.data}
      isLoading={expenses.isLoading}
      error={expenses.error}
      range={appliedRange}
      mockState={mockState}
    />
  </TabContent>
);

const AnalyticsPage = ({ mockState = ANALYTICS_MOCK_STATES.READY, initialActiveTabIndex = 0 }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(initialActiveTabIndex);
  const [preset, setPreset] = useState(ANALYTICS_PRESETS.THIS_MONTH);
  const [draftRange, setDraftRange] = useState(() => getPresetRange(ANALYTICS_PRESETS.THIS_MONTH));
  const [appliedRange, setAppliedRange] = useState(() => getPresetRange(ANALYTICS_PRESETS.THIS_MONTH));
  const maxSelectableDate = getBusinessTodayValue();
  const comparisonRange = useMemo(() => getComparisonRange(appliedRange), [appliedRange]);
  const comparisonDayCount = useMemo(() => getAnalyticsRangeDayCount(comparisonRange), [comparisonRange]);
  const comparisonDayLabel = `${comparisonDayCount} ${comparisonDayCount === 1 ? "día" : "días"}`;
  const hasDraftChanges = !areSameRange(draftRange, appliedRange);
  const canApplyRange = hasDraftChanges && isValidRange(draftRange);
  const overview = useAnalyticsOverview({ range: appliedRange, comparisonRange, mockState });
  const salesTimeseries = useAnalyticsSalesTimeseries({ range: appliedRange, mockState });
  const topProducts = useAnalyticsTopProducts({ range: appliedRange, mockState });
  const expenses = useAnalyticsExpenses({ range: appliedRange, mockState });
  const isDashboardLoading = overview.isLoading || salesTimeseries.isLoading || topProducts.isLoading || expenses.isLoading;
  const hasCurrentSalesData = salesTimeseries.data?.current?.some(({ netSales, salesCount, grossProfit }) =>
    netSales > 0 || salesCount > 0 || grossProfit > 0
  ) ?? false;
  const isGlobalEmpty = !isDashboardLoading &&
    !overview.error &&
    !salesTimeseries.error &&
    !expenses.error &&
    !!salesTimeseries.data &&
    !!expenses.data &&
    !hasCurrentSalesData &&
    expenses.data.total === 0;

  const handlePresetChange = (event) => {
    const nextPreset = event.target.value;
    setPreset(nextPreset);

    if (nextPreset !== ANALYTICS_PRESETS.CUSTOM) {
      setDraftRange(getPresetRange(nextPreset));
    }
  };

  const handleRangeChange = (key) => (event) => {
    setPreset(ANALYTICS_PRESETS.CUSTOM);
    setDraftRange((currentRange) => ({
      ...currentRange,
      [key]: event.target.value,
    }));
  };

  const handleApplyRange = () => {
    if (!canApplyRange) return;
    setAppliedRange(draftRange);
  };

  const panes = [
    {
      menuItem: ANALYTICS_TAB_OPTIONS[0].label,
      render: () => (
        <Tab.Pane>
          <SummaryPane
            overview={overview}
            salesTimeseries={salesTimeseries}
            topProducts={topProducts}
            expenses={expenses}
            isGlobalEmpty={isGlobalEmpty}
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: ANALYTICS_TAB_OPTIONS[1].label,
      render: () => (
        <Tab.Pane>
          <SalesPane
            overview={overview}
            salesTimeseries={salesTimeseries}
            appliedRange={appliedRange}
            mockState={mockState}
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: ANALYTICS_TAB_OPTIONS[2].label,
      render: () => (
        <Tab.Pane>
          <ExpensesPane
            expenses={expenses}
            appliedRange={appliedRange}
            mockState={mockState}
          />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <Page>
      <HeaderPanel>
        <TitleGroup>
          <Eyebrow>Resumen del negocio</Eyebrow>
          <Title>Análisis de datos</Title>
          <Subtitle>Período anterior: {formatDateRange(comparisonRange)} ({comparisonDayLabel})</Subtitle>
        </TitleGroup>
        <FiltersGrid>
          <Field>
            Período
            <Select value={preset} onChange={handlePresetChange}>
              {ANALYTICS_PRESET_OPTIONS.map((option) => (
                <option key={option.key} value={option.value}>{option.text}</option>
              ))}
            </Select>
          </Field>
          <Field>
            Desde
            <DateInput type="date" value={draftRange.from} max={draftRange.to < maxSelectableDate ? draftRange.to : maxSelectableDate} onChange={handleRangeChange("from")} />
          </Field>
          <Field>
            Hasta
            <DateInput type="date" value={draftRange.to} min={draftRange.from} max={maxSelectableDate} onChange={handleRangeChange("to")} />
          </Field>
          <IconedButton
            text="Aplicar período"
            icon={ICONS.CHECK}
            color={COLORS.BLUE}
            disabled={!canApplyRange}
            onClick={handleApplyRange}
            width="100%"
            height="38px"
          />
        </FiltersGrid>
      </HeaderPanel>

      <AnalyticsTabs
        panes={panes}
        activeIndex={activeTabIndex}
        onTabChange={(_, { activeIndex }) => setActiveTabIndex(activeIndex)}
      />
    </Page>
  );
};

export default AnalyticsPage;
