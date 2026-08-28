import { IconTooltip } from "@/common/components/tooltips";
import { COLORS, ICONS } from "@/common/constants";
import {
  analyticsKpiConfig,
  getChangeDisplay,
  getChangeIsPositive,
} from "@/components/analytics/analytics.utils";
import {
  ChangePill,
  KpiCard,
  KpiFooter,
  KpiGrid,
  KpiHeader,
  KpiLabel,
  KpiSecondaryText,
  KpiValue,
  Panel,
  PreviousValue,
  SkeletonCard,
  SkeletonGrid,
  StateBox,
} from "./styles";

const buildTooltipContent = ({ tooltip, metricTooltip }) => {
  const parts = [tooltip];

  if (metricTooltip && metricTooltip !== tooltip) {
    parts.push(metricTooltip);
  }

  return parts.filter(Boolean).join("\n");
};

const Kpis = ({ overview, isLoading, error, config = analyticsKpiConfig, columns }) => {
  if (isLoading) {
    return (
      <SkeletonGrid $columns={columns} aria-label="Cargando indicadores">
        {config.map((kpi) => <SkeletonCard key={kpi.key} />)}
      </SkeletonGrid>
    );
  }

  if (error) {
    return <Panel><StateBox>No se pudieron cargar los indicadores principales.</StateBox></Panel>;
  }

  return (
    <KpiGrid $columns={columns}>
      {config.map(({ key, label, tooltip, format, changeKey, previousLabel, previousLabelPosition, higherIsPositive, isPercentagePoints, secondaryMetric }) => {
        const metric = overview?.kpis?.[key];
        const isAvailable = metric?.isAvailable !== false;
        const change = getChangeDisplay({ metric, changeKey, isPercentagePoints });
        const positive = getChangeIsPositive({ change, higherIsPositive });
        const secondary = secondaryMetric ? overview?.kpis?.[secondaryMetric.key] : null;
        const secondaryIsAvailable = isAvailable && secondary?.isAvailable !== false && secondary?.value !== null && secondary?.value !== undefined;
        const tooltipContent = buildTooltipContent({
          tooltip,
          metricTooltip: metric?.tooltip,
        });
        const previousValue = isAvailable ? format(metric?.previousValue ?? 0) : "Sin datos";

        return (
          <KpiCard key={key}>
            <div>
              <KpiHeader>
                <KpiLabel>
                  <span>{label}</span>
                  <IconTooltip
                    ariaLabel={`Información: ${label}`}
                    color={metric?.hasWarning ? COLORS.ORANGE : COLORS.BLUE}
                    content={tooltipContent}
                    icon={metric?.hasWarning ? ICONS.EXCLAMATION_CIRCLE : ICONS.INFO_CIRCLE}
                  />
                </KpiLabel>
              </KpiHeader>
              <KpiValue>
                {isAvailable ? format(metric?.value ?? 0) : "Sin datos"}
                {secondaryMetric && (
                  <KpiSecondaryText>
                    {secondaryIsAvailable
                      ? `${secondaryMetric.format(secondary.value)} ${secondaryMetric.label}`
                      : secondaryMetric.unavailableLabel}
                  </KpiSecondaryText>
                )}
              </KpiValue>
            </div>
            <KpiFooter>
              <ChangePill $positive={positive} $neutral={!isAvailable}>
                {isAvailable ? (
                  <>
                    <span aria-hidden="true">{change.direction === "up" ? "↑" : "↓"}</span>
                    {change.value}
                  </>
                ) : "Sin datos"}
              </ChangePill>
              <PreviousValue>
                {previousLabelPosition === "prefix"
                  ? `${previousLabel} ${previousValue}`
                  : `${previousValue} ${previousLabel}`}
              </PreviousValue>
            </KpiFooter>
          </KpiCard>
        );
      })}
    </KpiGrid>
  );
};

export default Kpis;
