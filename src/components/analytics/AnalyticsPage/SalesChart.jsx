import { getFormatedPrice } from "@/common/utils";
import { ANALYTICS_GROUP_BY } from "@/components/analytics/analytics.constants";
import {
  analyticsGroupByLabels,
  formatBucketLabel,
  formatXAxisLabel,
  getChartCoordinates,
  getChartTooltipPosition,
  getPolylinePoints,
  getXAxisLabelIndexes,
  SALES_CHART_CONFIG,
} from "@/components/analytics/analytics.utils";
import { useState } from "react";
import SectionState from "./SectionState";
import {
  ChartLegend,
  ChartTooltipTarget,
  ChartWrap,
  LegendItem,
  MainChartBody,
  Panel,
  PanelHeader,
  PanelMeta,
  PanelTitle,
} from "./styles";

const SalesChart = ({ data, isLoading, error, compact = false, currentOnly = false }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const current = data?.current ?? [];
  const previous = data?.previous ?? [];
  const groupBy = data?.groupBy ?? ANALYTICS_GROUP_BY.DAY;
  const isEmpty = !current.some(({ netSales, salesCount, grossProfit }) =>
    netSales > 0 || salesCount > 0 || grossProfit > 0
  );
  const { width, height, padding, gridValues } = SALES_CHART_CONFIG;
  const comparisonPoints = currentOnly ? [] : previous;
  const maxValue = Math.max(1, ...current.map(({ netSales }) => netSales), ...comparisonPoints.map(({ netSales }) => netSales));
  const currentPoints = getPolylinePoints({ points: current, maxValue, width, height, padding });
  const previousPoints = getPolylinePoints({ points: comparisonPoints, maxValue, width, height, padding });
  const currentCoordinates = getChartCoordinates({ points: current, maxValue, width, height, padding });
  const previousCoordinates = getChartCoordinates({ points: comparisonPoints, maxValue, width, height, padding });
  const xAxisLabelIndexes = getXAxisLabelIndexes(current);
  const hoveredTooltip = hoveredPoint ? getChartTooltipPosition({ point: hoveredPoint, width, height }) : null;

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Evolución de ventas</PanelTitle>
        <PanelMeta>{analyticsGroupByLabels[groupBy] ?? groupBy}</PanelMeta>
      </PanelHeader>
      <MainChartBody $compact={compact}>
        <SectionState
          isLoading={isLoading}
          error={error}
          empty={isEmpty}
          emptyMessage="Todavía no hay ventas para graficar en este período."
        >
          <ChartWrap $compact={compact}>
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
              {!currentOnly && <polyline points={previousPoints} fill="none" stroke="#98a2b3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="9 9" />}
              <polyline points={currentPoints} fill="none" stroke="#2185d0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              {currentCoordinates.map((point, index) => {
                const previousPoint = currentOnly ? null : previous[index];
                const previousCoordinate = currentOnly ? null : previousCoordinates[index];
                const tooltipPoint = {
                  ...point,
                  ...(previousPoint ? { previous: previousPoint } : {}),
                  ...(previousCoordinate ? { previousCoordinate } : {}),
                };

                return (
                  <ChartTooltipTarget
                    key={`tooltip_${point.periodStart}`}
                    cx={point.x}
                    cy={point.y}
                    r="13"
                    fill="transparent"
                    stroke="transparent"
                    tabIndex={0}
                    data-tooltip-date={point.periodStart}
                    data-tooltip-current={point.netSales}
                    {...(!currentOnly ? { "data-tooltip-previous": previousPoint?.netSales ?? "" } : {})}
                    onFocus={() => setHoveredPoint(tooltipPoint)}
                    onBlur={() => setHoveredPoint(null)}
                    onMouseEnter={() => setHoveredPoint(tooltipPoint)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
              {hoveredPoint && hoveredTooltip && (
                <g pointerEvents="none">
                  {hoveredPoint.previousCoordinate && (
                    <circle
                      cx={hoveredPoint.previousCoordinate.x}
                      cy={hoveredPoint.previousCoordinate.y}
                      r="9"
                      fill="#98a2b3"
                      stroke="#ffffff"
                      strokeWidth="3"
                    />
                  )}
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
          {!currentOnly && (
            <ChartLegend>
              <LegendItem>Periodo actual</LegendItem>
              <LegendItem $muted>Periodo anterior</LegendItem>
            </ChartLegend>
          )}
        </SectionState>
      </MainChartBody>
    </Panel>
  );
};

export default SalesChart;
