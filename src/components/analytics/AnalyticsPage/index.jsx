"use client";

import {
  useAnalyticsExpenseCategoryDetails,
  useAnalyticsExpenses,
  useAnalyticsOverview,
  useAnalyticsSalesTimeseries,
  useAnalyticsTopProducts,
} from "@/api/analytics";
import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, Icon, OverflowWrapper } from "@/common/components/custom";
import { Table } from "@/common/components/table";
import { IconTooltip } from "@/common/components/tooltips";
import { COLORS, ICONS, SIZES } from "@/common/constants";
import { getFormatedPrice } from "@/common/utils";
import {
  ANALYTICS_GROUP_BY,
  ANALYTICS_MOCK_STATES,
  ANALYTICS_PRESETS,
  ANALYTICS_PRESET_OPTIONS,
} from "@/components/analytics/analytics.constants";
import {
  analyticsGroupByLabels,
  analyticsKpiConfig,
  areSameRange,
  formatBucketLabel,
  formatCategoryName,
  formatDateRange,
  formatFullDate,
  formatPercent,
  formatXAxisLabel,
  getBusinessTodayValue,
  getChangeDisplay,
  getChangeIsPositive,
  getChartCoordinates,
  getChartTooltipPosition,
  getComparisonRange,
  getPolylinePoints,
  getPresetRange,
  getXAxisLabelIndexes,
  isValidRange,
  SALES_CHART_CONFIG,
} from "@/components/analytics/analytics.utils";
import { useMemo, useState } from "react";
import { Modal, Transition } from "semantic-ui-react";
import {
  BarFill,
  BarTrack,
  CategoryAmountGroup,
  ChangePill,
  ChartLegend,
  ChartTooltipPoint,
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
  KpiCard,
  KpiFooter,
  KpiGrid,
  KpiLabel,
  KpiValue,
  LegendItem,
  MainChartBody,
  Page,
  Panel,
  PanelBody,
  PanelHeader,
  PanelMeta,
  PanelTitle,
  PreviousValue,
  RankedAmount,
  RankedItem,
  RankedList,
  RankedMeta,
  RankedName,
  SecondaryGrid,
  Select,
  SkeletonCard,
  SkeletonGrid,
  StateBox,
  Subtitle,
  SummaryLabel,
  SummaryValue,
  Title,
  TitleGroup,
} from "./styles";

const SectionState = ({ isLoading, error, empty, emptyMessage, children }) => {
  if (isLoading) return <StateBox>Cargando análisis...</StateBox>;
  if (error) return <StateBox>No se pudo cargar este bloque.</StateBox>;
  if (empty) return <StateBox>{emptyMessage}</StateBox>;

  return children;
};

const Kpis = ({ overview, isLoading, error }) => {
  if (isLoading) {
    return (
      <SkeletonGrid aria-label="Cargando indicadores">
        {analyticsKpiConfig.map((kpi) => <SkeletonCard key={kpi.key} />)}
      </SkeletonGrid>
    );
  }

  if (error) {
    return <Panel><StateBox>No se pudieron cargar los indicadores principales.</StateBox></Panel>;
  }

  return (
    <KpiGrid>
      {analyticsKpiConfig.map(({ key, label, tooltip, format, changeKey, previousLabel, higherIsPositive, isPercentagePoints }) => {
        const metric = overview?.kpis?.[key];
        const change = getChangeDisplay({ metric, changeKey, isPercentagePoints });
        const positive = getChangeIsPositive({ change, higherIsPositive });

        return (
          <KpiCard key={key}>
            <div>
              <KpiLabel>
                <span>{label}</span>
                <IconTooltip
                  ariaLabel={`Información: ${label}`}
                  color={COLORS.BLUE}
                  content={tooltip}
                  icon={ICONS.INFO_CIRCLE}
                />
              </KpiLabel>
              <KpiValue>{format(metric?.value ?? 0)}</KpiValue>
            </div>
            <KpiFooter>
              <ChangePill $positive={positive}>
                <span aria-hidden="true">{change.direction === "up" ? "↑" : "↓"}</span>
                {change.value}
              </ChangePill>
              <PreviousValue>{format(metric?.previousValue ?? 0)} {previousLabel}</PreviousValue>
            </KpiFooter>
          </KpiCard>
        );
      })}
    </KpiGrid>
  );
};

const SalesChart = ({ data, isLoading, error }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const current = data?.current ?? [];
  const previous = data?.previous ?? [];
  const groupBy = data?.groupBy ?? ANALYTICS_GROUP_BY.DAY;
  const isEmpty = current.length === 0;
  const { width, height, padding, gridValues } = SALES_CHART_CONFIG;
  const maxValue = Math.max(1, ...current.map(({ netSales }) => netSales), ...previous.map(({ netSales }) => netSales));
  const currentPoints = getPolylinePoints({ points: current, maxValue, width, height, padding });
  const previousPoints = getPolylinePoints({ points: previous, maxValue, width, height, padding });
  const currentCoordinates = getChartCoordinates({ points: current, maxValue, width, height, padding });
  const xAxisLabelIndexes = getXAxisLabelIndexes(current);
  const hoveredTooltip = hoveredPoint ? getChartTooltipPosition({ point: hoveredPoint, width, height }) : null;

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Evolución de ventas</PanelTitle>
        <PanelMeta>{analyticsGroupByLabels[groupBy] ?? groupBy}</PanelMeta>
      </PanelHeader>
      <MainChartBody>
        <SectionState
          isLoading={isLoading}
          error={error}
          empty={isEmpty}
          emptyMessage="Todavía no hay ventas para graficar en este período."
        >
          <ChartWrap>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolución de ventas netas">
              <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
              {gridValues.map((ratio) => {
                const y = padding.top + ((1 - ratio) * (height - padding.top - padding.bottom));
                const value = maxValue * ratio;

                return (
                  <g key={ratio}>
                    <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e7edf3" strokeWidth="1" />
                    <text x="16" y={y + 4} fill="#7b8794" fontSize="12" fontWeight="700">
                      {`$${Math.round(value / 1000)}k`}
                    </text>
                  </g>
                );
              })}
              {current.map((point, index) => {
                if (!xAxisLabelIndexes.has(index)) return null;
                const x = currentCoordinates[index]?.x ?? padding.left;

                return (
                  <text key={point.periodStart} x={x} y={height - 13} textAnchor="middle" fill="#7b8794" fontSize="12" fontWeight="700">
                    {formatXAxisLabel(point, groupBy)}
                  </text>
                );
              })}
              <polyline points={previousPoints} fill="none" stroke="#98a2b3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="9 9" />
              <polyline points={currentPoints} fill="none" stroke="#2185d0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              {currentCoordinates.map((point, index) => {
                const previousPoint = previous[index];
                const tooltipPoint = {
                  ...point,
                  previous: previousPoint,
                };

                return (
                  <ChartTooltipPoint
                    key={`tooltip_${point.periodStart}`}
                    cx={point.x}
                    cy={point.y}
                    r={12}
                    fill="transparent"
                    stroke="transparent"
                    tabIndex={0}
                    data-tooltip-date={point.periodStart}
                    data-tooltip-current={point.netSales}
                    data-tooltip-previous={previousPoint?.netSales ?? ""}
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
                    {`Período actual: ${getFormatedPrice(hoveredPoint.netSales)}`}
                  </text>
                  {hoveredPoint.previous && (
                    <text x={hoveredTooltip.x + 12} y={hoveredTooltip.y + 60} fill="#ffffff" fontSize="12">
                      {`Período anterior: ${getFormatedPrice(hoveredPoint.previous.netSales)}`}
                    </text>
                  )}
                </g>
              )}
            </svg>
          </ChartWrap>
          <ChartLegend>
            <LegendItem>Periodo actual</LegendItem>
            <LegendItem $muted>Periodo anterior</LegendItem>
          </ChartLegend>
        </SectionState>
      </MainChartBody>
    </Panel>
  );
};

const TopProducts = ({ data, isLoading, error }) => {
  const items = data?.items ?? [];
  const maxRevenue = Math.max(1, ...items.map(({ revenue }) => revenue));

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Top productos por facturación</PanelTitle>
        <PanelMeta>{items.length ? `${items.length} productos` : ""}</PanelMeta>
      </PanelHeader>
      <PanelBody>
        <SectionState
          isLoading={isLoading}
          error={error}
          empty={!items.length}
          emptyMessage="No hay productos con facturación para este período."
        >
          <RankedList>
            {items.map((item) => (
              <RankedItem key={item.productId}>
                <div>
                  <RankedName>
                    <OverflowWrapper maxWidth="100%" popupContent={item.name}>
                      {item.name}
                    </OverflowWrapper>
                  </RankedName>
                  <RankedMeta>{item.brandName} · {item.commercialQuantity} unidades</RankedMeta>
                </div>
                <RankedAmount>{getFormatedPrice(item.revenue)}</RankedAmount>
                <BarTrack>
                  <BarFill $width={(item.revenue / maxRevenue) * 100} />
                </BarTrack>
              </RankedItem>
            ))}
          </RankedList>
        </SectionState>
      </PanelBody>
    </Panel>
  );
};

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

const ExpensesByCategory = ({ data, isLoading, error, range, mockState }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const hasExpensesData = !!data;
  const categories = hasExpensesData ? data.categories : [];
  const maxAmount = Math.max(1, ...categories.map(({ amount }) => amount));
  const hasCategories = categories.length > 0;
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
              {categories.map((category) => (
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
                    <RankedMeta>{formatPercent(category.sharePct)}</RankedMeta>
                  </div>
                  <CategoryAmountGroup>
                    <RankedAmount>{getFormatedPrice(category.amount)}</RankedAmount>
                    <Icon name={ICONS.CHEVRON_RIGHT} color={COLORS.BLUE} />
                  </CategoryAmountGroup>
                  <BarTrack>
                    <BarFill $variant="expense" $width={(category.amount / maxAmount) * 100} />
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

const AnalyticsPage = ({ mockState = ANALYTICS_MOCK_STATES.READY }) => {
  const [preset, setPreset] = useState(ANALYTICS_PRESETS.THIS_MONTH);
  const [draftRange, setDraftRange] = useState(() => getPresetRange(ANALYTICS_PRESETS.THIS_MONTH));
  const [appliedRange, setAppliedRange] = useState(() => getPresetRange(ANALYTICS_PRESETS.THIS_MONTH));
  const maxSelectableDate = getBusinessTodayValue();
  const comparisonRange = useMemo(() => getComparisonRange(appliedRange), [appliedRange]);
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

  return (
    <Page>
      <HeaderPanel>
        <TitleGroup>
          <Eyebrow>Resumen del negocio</Eyebrow>
          <Title>Análisis de datos</Title>
          <Subtitle>Comparado con {formatDateRange(comparisonRange)}</Subtitle>
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

      {isGlobalEmpty ? (
        <Panel>
          <StateBox>No hay datos para este período</StateBox>
        </Panel>
      ) : (
        <>
          <Kpis overview={overview.data} isLoading={overview.isLoading} error={overview.error} />

          <SalesChart
            data={salesTimeseries.data}
            isLoading={salesTimeseries.isLoading}
            error={salesTimeseries.error}
          />

          <SecondaryGrid>
            <TopProducts
              data={topProducts.data}
              isLoading={topProducts.isLoading}
              error={topProducts.error}
            />
            <ExpensesByCategory
              data={expenses.data}
              isLoading={expenses.isLoading}
              error={expenses.error}
              range={appliedRange}
              mockState={mockState}
            />
          </SecondaryGrid>
        </>
      )}
    </Page>
  );
};

export default AnalyticsPage;
