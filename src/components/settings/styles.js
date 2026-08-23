import { FlexColumn } from "@/common/components/custom";
import styled from "styled-components";

export const SettingsTabsContainer = styled(FlexColumn)`
  max-width: 100%;
  min-width: 0;

  .ui.attached.segment {
    max-width: 100%;
    min-width: 0;
  }

  @media (max-width: 767px) {
    .ui.tabular.menu {
      max-width: 100%;
      flex-wrap: wrap;
      overflow: visible;
    }

    .ui.tabular.menu .item {
      white-space: nowrap;
    }
  }
`;
