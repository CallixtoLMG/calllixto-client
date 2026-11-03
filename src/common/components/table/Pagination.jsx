import { POPUP_POSITIONS, PAGE_SIZE_OPTIONS } from "@/common/constants";
import { Popup, Pagination as SPagination } from "semantic-ui-react";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { Dropdown } from "../custom";
import ElementCounter from "./ElementCounter";
import { PaginationContainer } from "./styles";

const PAGE_SIZE_DROPDOWN_WIDTH = "92px";
const MOBILE_PAGE_SIZE_DROPDOWN_WIDTH = "58px";
const MOBILE_BREAKPOINT = 767;
const COMPACT_PAGINATION_BREAKPOINT = 1000;

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
    z-index: 30;
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

const PageSizePaginationContainer = styled(PaginationContainer)`
  z-index: ${({ $pageSizeOpen }) => ($pageSizeOpen ? 30 : 1)};
`;

const Pagination = ({
  activePage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const [isCompactPagination, setIsCompactPagination] = useState(false);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeDropdownRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${COMPACT_PAGINATION_BREAKPOINT}px)`);
    const updateIsCompactPagination = () => setIsCompactPagination(mediaQuery.matches);

    updateIsCompactPagination();
    mediaQuery.addEventListener("change", updateIsCompactPagination);

    return () => mediaQuery.removeEventListener("change", updateIsCompactPagination);
  }, []);

  useEffect(() => {
    if (!isPageSizeOpen) return undefined;

    const handleOutsidePointerDown = (event) => {
      if (!pageSizeDropdownRef.current?.contains(event.target)) {
        setIsPageSizeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsidePointerDown);
    document.addEventListener("touchstart", handleOutsidePointerDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsidePointerDown);
      document.removeEventListener("touchstart", handleOutsidePointerDown);
    };
  }, [isPageSizeOpen]);

  return (
    <PageSizePaginationContainer $justifyContent="space-between" $pageSizeOpen={isPageSizeOpen}>
      <ElementCounter
        fontWeight
        currentPage={activePage}
        pageSize={pageSize}
        totalItems={totalItems}
      />
      <NavigationPagination
        activePage={activePage}
        onPageChange={onPageChange}
        siblingRange={isCompactPagination ? 0 : 2}
        boundaryRange={isCompactPagination ? 1 : 2}
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
          <div
            ref={pageSizeDropdownRef}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <PageSizeDropdown
              options={PAGE_SIZE_OPTIONS}
              value={pageSize}
              onChange={(event, data) => {
                onPageSizeChange(event, data);
                setIsPageSizeOpen(false);
              }}
              onOpen={() => setIsPageSizeOpen(true)}
              onClose={() => setIsPageSizeOpen(false)}
              open={isPageSizeOpen}
              closeOnBlur={false}
              selectOnBlur={false}
              selection
              compact
              $boxShadow
              height="40px"
              width={PAGE_SIZE_DROPDOWN_WIDTH}
            />
          </div>
        )}
        position={POPUP_POSITIONS.LEFT_CENTER}
        mouseEnterDelay={500}
      />
    </PageSizePaginationContainer>
  );
};

export default Pagination;
