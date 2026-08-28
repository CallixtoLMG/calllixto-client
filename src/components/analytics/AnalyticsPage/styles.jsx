import { Modal as BaseModal } from "@/common/components/custom";
import { Tab as BaseTab } from "semantic-ui-react";
import styled, { css } from "styled-components";

const TABLET_BREAKPOINT = "1024px";
const MOBILE_BREAKPOINT = "767px";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  min-width: 0;
  color: #18212f;
`;

export const HeaderPanel = styled.section`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  background: #ffffff;

  @media (max-width: ${TABLET_BREAKPOINT}) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const Eyebrow = styled.div`
  color: #2185d0;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0;
`;

export const Title = styled.h1`
  margin: 0;
  color: #111827;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 24px;
  }
`;

export const Subtitle = styled.p`
  margin: 0;
  color: #667085;
  font-size: 14px;
  line-height: 1.45;
`;

export const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 180px 155px 155px 160px;
  gap: 12px;
  align-items: end;

  @media (max-width: ${TABLET_BREAKPOINT}) {
    grid-template-columns: 180px 155px 155px;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  color: #475467;
  font-size: 12px;
  font-weight: 700;
`;

const controlStyles = css`
  width: 100%;
  height: 38px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: #ffffff;
  color: #18212f;
  padding: 0 10px;
  font-size: 14px;
  min-width: 0;

  &:focus {
    border-color: #2185d0;
    box-shadow: 0 0 0 3px rgba(33, 133, 208, 0.14);
    outline: none;
  }
`;

export const Select = styled.select`
  ${controlStyles}
`;

export const DateInput = styled.input`
  ${controlStyles}
`;

export const AnalyticsTabs = styled(BaseTab)`
  &&&& {
    .ui.tabular.menu {
      margin: 0 0 14px;
      border-bottom-color: #dfe5ec;
      overflow-x: auto;
      overflow-y: hidden;
    }

    .ui.tabular.menu .item {
      color: #667085;
      font-size: 14px;
      font-weight: 800;
      white-space: nowrap;
    }

    .ui.tabular.menu .active.item {
      color: #2185d0;
      border-color: #dfe5ec;
      border-bottom-color: #ffffff;
    }

    .ui.tab {
      padding: 0;
      border: 0;
      background: transparent;
      box-shadow: none;
    }
  }
`;

export const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
`;

export const KpiGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns ?? 3}, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: ${TABLET_BREAKPOINT}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    grid-template-columns: 1fr;
  }
`;

export const KpiCard = styled.article`
  min-width: 0;
  min-height: 128px;
  padding: 17px;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
`;

export const KpiHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    flex-wrap: wrap;
  }
`;

export const KpiLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: #667085;
  font-size: 13px;
  font-weight: 700;
`;

export const KpiValue = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  max-width: 100%;
  color: #101828;
  font-size: 26px;
  line-height: 1.12;
  font-weight: 800;
  min-width: 0;
  overflow-wrap: normal;
  white-space: nowrap;

  @media (min-width: ${TABLET_BREAKPOINT}) and (max-width: 1180px) {
    font-size: 23px;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 24px;
  }

  @media (max-width: 420px) {
    font-size: 22px;
  }
`;

export const KpiSecondaryText = styled.span`
  flex: 0 0 auto;
  color: #667085;
  font-size: 12px;
  line-height: 1.25;
  font-weight: 800;
  white-space: nowrap;
`;

export const KpiFooter = styled.div`
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: end;
  gap: 8px;
  min-width: 0;

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

export const ChangePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  min-width: max-content;
  max-width: 100%;
  color: ${({ $neutral, $positive }) => ($neutral ? "#667085" : ($positive ? "#087443" : "#b42318"))};
  background: ${({ $neutral, $positive }) => ($neutral ? "#f8fafc" : ($positive ? "#ecfdf3" : "#fef3f2"))};
  border: 1px solid ${({ $neutral, $positive }) => ($neutral ? "#e5e9f0" : ($positive ? "#abefc6" : "#fecdca"))};
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 12px;
  line-height: 1.2;
  font-weight: 800;
  white-space: nowrap;

  @media (min-width: ${TABLET_BREAKPOINT}) and (max-width: 1180px) {
    font-size: 11px;
  }
`;

export const PreviousValue = styled.span`
  color: #98a2b3;
  font-size: 12px;
  text-align: right;
  min-width: 0;
  overflow-wrap: anywhere;

  @media (max-width: 380px) {
    text-align: left;
  }
`;

export const Panel = styled.section`
  min-width: 0;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  padding: 17px 18px 0;
  min-width: 0;
`;

export const PanelHeaderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
`;

export const PanelTitle = styled.h2`
  margin: 0;
  color: #111827;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 800;
`;

export const PanelTitleInline = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const PanelMeta = styled.div`
  color: #667085;
  font-size: 12px;
  font-weight: 700;
  text-align: right;
`;

export const PanelDescription = styled.p`
  margin: 0;
  color: #667085;
  font-size: 12px;
  line-height: 1.4;
`;

export const SegmentedControl = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border: 1px solid #dfe5ec;
  border-radius: 7px;
  background: #f8fafc;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
  }
`;

export const SegmentButton = styled.button`
  border: 0;
  border-radius: 5px;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#2185d0" : "#667085")};
  box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgba(16, 24, 40, 0.12)" : "none")};
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  min-height: 30px;
  padding: 0 10px;
  white-space: nowrap;

  &:focus-visible {
    outline: 3px solid rgba(33, 133, 208, 0.18);
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    flex: 1;
  }
`;

export const PanelBody = styled.div`
  padding: 18px;
  min-width: 0;
`;

export const MainChartBody = styled(PanelBody)`
  padding-top: ${({ $compact }) => ($compact ? "8px" : "12px")};
`;

export const ChartWrap = styled.div`
  width: 100%;
  min-width: 0;
  height: ${({ $compact }) => ($compact ? "280px" : "340px")};

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    height: ${({ $compact }) => ($compact ? "240px" : "280px")};
  }
`;

export const ChartLegend = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 10px;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
`;

export const ChartTooltipTarget = styled.circle`
  cursor: pointer;
`;

export const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: "";
    width: 18px;
    height: 3px;
    border-radius: 999px;
    background: ${({ $expense, $muted }) => {
    if ($expense) return "#5f6c7b";
    return $muted ? "#98a2b3" : "#2185d0";
  }};
  }
`;

export const SecondaryGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;

  @media (max-width: ${TABLET_BREAKPOINT}) {
    grid-template-columns: 1fr;
  }
`;

export const HighlightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    grid-template-columns: 1fr;
  }
`;

export const HighlightItem = styled.div`
  min-width: 0;
  padding: 12px;
  border: 1px solid #edf0f4;
  border-radius: 6px;
  background: #f8fafc;
`;

export const HighlightLabel = styled.div`
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
`;

export const HighlightTitle = styled.div`
  margin-top: 6px;
  color: #18212f;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.25;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HighlightMeta = styled.div`
  margin-top: 3px;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
`;

export const HighlightAmount = styled.div`
  margin-top: 8px;
  color: #111827;
  font-size: 16px;
  font-weight: 800;
  white-space: nowrap;
`;

export const RankedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const RankingBody = styled.div`
  position: relative;
  min-height: 240px;

  > div {
    position: relative;
    height: 240px;
    min-height: 240px;
  }

  .ui.loader {
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
  }
`;

export const RankedItem = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  min-width: 0;
`;

export const ExpenseCategoryItem = styled.button`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  min-width: 0;
  width: 100%;
  border: 0;
  border-radius: 6px;
  background: transparent;
  padding: 6px;
  color: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }

  &:focus-visible {
    outline: 3px solid rgba(33, 133, 208, 0.18);
  }
`;

export const CategoryAmountGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const RankedName = styled.div`
  color: #18212f;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.25;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RankedMeta = styled.div`
  margin-top: 3px;
  color: #667085;
  font-size: 12px;
`;

export const RankedAmount = styled.div`
  color: #111827;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
`;

export const BarTrack = styled.div`
  grid-column: 1 / -1;
  height: 8px;
  border-radius: 999px;
  background: #edf2f7;
  overflow: hidden;
`;

export const BarFill = styled.div`
  height: 100%;
  width: ${({ $width }) => `${Math.max(2, Math.min($width, 100))}%`};
  border-radius: inherit;
  background: ${({ $variant }) => ($variant === "expense" ? "#5f6c7b" : "#2185d0")};
`;

export const ExpenseSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 16px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    grid-template-columns: 1fr;
  }
`;

export const ExpenseSummaryItem = styled.div`
  padding: 10px;
  border: 1px solid #edf0f4;
  border-radius: 6px;
  background: #f8fafc;
  min-width: 0;
`;

export const SummaryLabel = styled.div`
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
`;

export const SummaryValue = styled.div`
  margin-top: 4px;
  color: #18212f;
  font-size: 15px;
  font-weight: 800;
  overflow-wrap: anywhere;
`;

export const DetailModalHeader = styled.div`
  position: relative;
  padding: 16px 54px 14px 18px;
  border-bottom: 1px solid #e5e9f0;
  background: #f8fafc;
`;

export const DetailModalTitle = styled.h3`
  margin: 0;
  color: #111827;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 800;
`;

export const DetailModalSummary = styled.p`
  margin: 6px 0 0;
  color: #667085;
  font-size: 14px;
  font-weight: 700;
`;

export const DetailModal = styled(BaseModal)`
  &&&& {
    .content {
      padding: 18px !important;
      background: #ffffff;
    }

    .scrolling.content {
      max-height: min(62vh, 620px);
    }

    .actions {
      padding: 12px 18px !important;
      background: #f8fafc;
      border-top: 1px solid #e5e9f0;
    }

    @media (max-width: ${MOBILE_BREAKPOINT}) {
      width: 94% !important;
      max-width: 94% !important;

      .content {
        padding: 14px !important;
      }

      .actions > div {
        max-width: 100%;
        justify-content: flex-end;
      }
    }
  }
`;

export const DetailCloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover,
  &:focus-visible {
    background: rgba(0, 0, 0, 0.06);
    color: rgba(0, 0, 0, 0.85);
    outline: none;
  }

  i.icon {
    margin: 0 !important;
  }
`;

export const DetailTableWrap = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;

  &&&& {
    table.ui.table {
      width: 100% !important;
      min-width: 100% !important;
      table-layout: fixed;
    }

    th,
    td {
      min-width: 0;
      overflow: hidden;
      text-transform: none !important;
    }

    th:first-child {
      text-align: left !important;
    }

    th:not(:first-child) {
      text-align: right !important;
    }

    td {
      color: #18212f;
      font-size: 13px;
      font-weight: 700;
    }

    @media (max-width: ${MOBILE_BREAKPOINT}) {
      overflow-x: auto;

      table.ui.table {
        min-width: 680px !important;
      }
    }
  }
`;

export const DetailNameCell = styled.div`
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const StateBox = styled.div`
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #667085;
  text-align: center;
  font-size: 14px;
  line-height: 1.45;
`;

export const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns ?? 3}, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: ${TABLET_BREAKPOINT}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    grid-template-columns: 1fr;
  }
`;

export const SkeletonCard = styled.div`
  min-height: 128px;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  background: #f5f7fa;
`;
