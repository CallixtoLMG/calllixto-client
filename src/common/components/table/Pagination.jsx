import { PAGE_SIZE_OPTIONS } from "@/common/constants";
import { Popup, Pagination as SPagination } from "semantic-ui-react";
import { Dropdown } from "../custom";
import ElementCounter from "./ElementCounter";
import { PaginationContainer } from "./styles";

const Pagination = ({
  activePage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <PaginationContainer justifyContent="space-between" center>
      <ElementCounter
        fontWeight
        currentPage={activePage}
        pageSize={pageSize}
        totalItems={totalItems}
      />
      <SPagination
        activePage={activePage}
        onPageChange={onPageChange}
        siblingRange={2}
        boundaryRange={2}
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
          <Dropdown
            options={PAGE_SIZE_OPTIONS}
            value={pageSize}
            onChange={onPageSizeChange}
            selection
            compact
            boxShadow
            height="40px"
          />
        )}
        position="left center"
        mouseEnterDelay={500}
      />
    </PaginationContainer>
  );
};

export default Pagination;
