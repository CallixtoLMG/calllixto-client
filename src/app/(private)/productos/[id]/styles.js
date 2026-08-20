import styled from "styled-components";

export const ProductTabsContainer = styled.div`
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

    .ui.attached.segment {
      overflow-x: auto;
    }
  }
`;
