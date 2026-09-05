import styled from "styled-components";
import { Flex } from "@/common/components/custom";

export const FilterRoot = styled(Flex)`
  position: relative;
  z-index: 2;

  .react-datepicker-popper {
    z-index: 31;
  }

  @media (max-width: 767px) {
    flex-wrap: wrap;

    .field,
    .ui.dropdown {
      width: 100% !important;
    }
  }
`;

export const FilterFieldsRow = styled(Flex)`
  @media (max-width: 767px) {
    flex-wrap: wrap;
    width: 100%;

    .react-datepicker-wrapper,
    .react-datepicker__input-container {
      width: 100%;
    }
  }
`;

export const FilterActions = styled(Flex)`
  @media (max-width: 767px) {
    width: 100%;
    justify-content: flex-end;
  }
`;
