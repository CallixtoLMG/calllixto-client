import { Modal as BaseModal } from "@/common/components/custom";
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

export const KpiGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

export const KpiLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #667085;
  font-size: 13px;
  font-weight: 700;
`;

export const KpiValue = styled.div`
  color: #101828;
  font-size: 26px;
  line-height: 1.12;
  font-weight: 800;
  min-width: 0;
  overflow-wrap: anywhere;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 24px;
  }
`;

export const KpiFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`;

export const ChangePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  color: ${({ $positive }) => ($positive ? "#087443" : "#b42318")};
  background: ${({ $positive }) => ($positive ? "#ecfdf3" : "#fef3f2")};
  border: 1px solid ${({ $positive }) => ($positive ? "#abefc6" : "#fecdca")};
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
`;

export const PreviousValue = styled.span`
  color: #98a2b3;
  font-size: 12px;
  text-align: right;
  min-width: 0;
  overflow-wrap: anywhere;
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

export const PanelTitle = styled.h2`
  margin: 0;
  color: #111827;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 800;
`;

export const PanelMeta = styled.div`
  color: #667085;
  font-size: 12px;
  font-weight: 700;
  text-align: right;
`;

export const PanelBody = styled.div`
  padding: 18px;
  min-width: 0;
`;

export const MainChartBody = styled(PanelBody)`
  padding-top: 12px;
`;

export const ChartWrap = styled.div`
  width: 100%;
  min-width: 0;
  height: 340px;

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    height: 280px;
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

export const ChartTooltipPoint = styled.circle`
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
    background: ${({ $muted }) => ($muted ? "#98a2b3" : "#2185d0")};
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

export const RankedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
