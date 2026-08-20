import { POPUP_POSITIONS, PAGE_SIZE_OPTIONS } from "@/common/constants";
import { Popup, Pagination as SPagination } from "semantic-ui-react";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { Dropdown } from "../custom";
import ElementCounter from "./ElementCounter";
import { PaginationContainer } from "./styles";

const PAGE_SIZE_DROPDOWN_WIDTH = "92px";
const MOBILE_PAGE_SIZE_DROPDOWN_WIDTH = "58px";
const MOBILE_BREAKPOINT = 767;

const NavigationPagination = styled(SPagination)`
  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    &&& {
      display: flex;
      justify-content: center;
      margin: 0 !important;
      max-width: 100%;
      min-width: 0;
      flex: 1 1 auto;
    }

    &&& .item {
      min-width: 24px;
      padding-left: 0.45em !important;
      padding-right: 0.45em !important;
    }
  }
`;

const PageSizeDropdown = styled(Dropdown)`
  &&& {
    width: ${PAGE_SIZE_DROPDOWN_WIDTH}!important;
    min-width: ${PAGE_SIZE_DROPDOWN_WIDTH}!important;
    flex: 0 0 auto;
  }

  &&&.ui.selection.dropdown {
    display: flex;
    align-items: center;
    padding: 0 2.1em 0 0.9em!important;
  }

  &&& > .text {
    width: 100%!important;
    text-align: left!important;
  }

  &&& .menu {
    width: ${PAGE_SIZE_DROPDOWN_WIDTH}!important;
    min-width: ${PAGE_SIZE_DROPDOWN_WIDTH}!important;
  }

  &&& .menu > .item {
    width: 100%;
    text-align: left;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    &&& {
      width: ${MOBILE_PAGE_SIZE_DROPDOWN_WIDTH}!important;
      min-width: ${MOBILE_PAGE_SIZE_DROPDOWN_WIDTH}!important;
    }

    &&&.ui.selection.dropdown {
      padding: 0 1.45em 0 0.6em!important;
    }

    &&& .menu {
      width: ${MOBILE_PAGE_SIZE_DROPDOWN_WIDTH}!important;
      min-width: ${MOBILE_PAGE_SIZE_DROPDOWN_WIDTH}!important;
    }
  }
`;

const Pagination = ({
  activePage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  return (
    <PaginationContainer $justifyContent="space-between">
      <ElementCounter
        fontWeight
        currentPage={activePage}
        pageSize={pageSize}
        totalItems={totalItems}
      />
      <NavigationPagination
        activePage={activePage}
        onPageChange={onPageChange}
        siblingRange={isMobile ? 0 : 2}
        boundaryRange={isMobile ? 1 : 2}
        firstItem={null}
        lastItem={null}
        pointing
        secondary
        totalPages={totalPages}
      />
      <Popup
        size="mini"
        content="Elementos mostrados"
        trigger={(
          <PageSizeDropdown
            options={PAGE_SIZE_OPTIONS}
            value={pageSize}
            onChange={onPageSizeChange}
            selection
            compact
            $boxShadow
            height="40px"
            width={PAGE_SIZE_DROPDOWN_WIDTH}
          />
        )}
        position={POPUP_POSITIONS.LEFT_CENTER}
        mouseEnterDelay={500}
      />
    </PaginationContainer>
  );
};

export default Pagination;
