import { COLORS, DEFAULT_PAGE_SIZE, ICONS, SHORTKEYS, SORTING } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { Loader } from "@/components/layout";
import { useKeyboardShortcuts } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Checkbox, Header, Icon } from "semantic-ui-react";
import { IconedButton, PopupActions } from "../buttons";
import { CenteredFlex, Flex } from "../custom";
import Actions from "./Actions";
import Pagination from "./Pagination";
import { ActionsContainer, Cell, Container, HeaderCell, InnerActionsContainer, LinkCell, Table, TableHeader, TableRow } from "./styles";
const { ASC, DESC } = SORTING;

const CustomTable = ({
  isLoading,
  headers = [],
  elements = [],
  page,
  actions = [],
  mainKey = 'id',
  $tableHeight,
  $deleteButtonInside,
  color,
  selection = {},
  onSelectionChange,
  selectionActions = [],
  basic,
  $wrap,
  clearSelection,
  selectAllCurrentPageElements,
  paginate,
  filters = {},
  setFilters = () => { },
  onFilter = () => true,
  onDownloadExcel
}) => {

  const { push } = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isSelectable = useMemo(() => !!selectionActions.length, [selectionActions]);
  const [activePage, setActivePage] = useState(filters?.page ?? 1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupOpenId, setPopupOpenId] = useState(null);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const tableRef = useRef(null);
  const [sortConfig, setSortConfig] = useState(filters?.sorting ?? { key: mainKey, direction: ASC });

  const handleSort = (columnKey) => {
    let newSorting = { key: columnKey, direction: ASC };
    if (sortConfig.key === columnKey) {
      newSorting = {
        key: columnKey,
        direction: sortConfig.direction === ASC ? DESC : ASC
      };
    }
    setSortConfig(newSorting);
    setFilters({ ...filters, sorting: newSorting });
  };

  const filteredElements = useMemo(() => {
    let result = elements.filter(onFilter);

    if (sortConfig.key) {
      const header = headers.find(h => h.key === sortConfig.key);

      if (header) {
        result = result.sort((a, b) => {
          const aVal = header?.sortValue ? header.sortValue(a) : a[sortConfig.key];
          const bVal = header?.sortValue ? header.sortValue(b) : b[sortConfig.key];

          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const cleanA = aVal.trim().toLowerCase();
            const cleanB = bVal.trim().toLowerCase();

            return sortConfig.direction === ASC
              ? cleanA.trim().toLowerCase().localeCompare(cleanB, 'es', { sensitivity: 'base' })
              : cleanB.trim().toLowerCase().localeCompare(cleanA, 'es', { sensitivity: 'base' });
          }

          return sortConfig.direction === ASC
            ? aVal - bVal
            : bVal - aVal;
        });

      }
    }

    return result;
  }, [elements, headers, onFilter, sortConfig]);


  const pages = useMemo(() => (paginate ? Math.ceil(filteredElements.length / pageSize) : 1), [filteredElements, pageSize, paginate]);
  const currentPageElements = useMemo(() => {
    if (!paginate) {
      return filteredElements;
    }
    const startIndex = (activePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredElements.slice(startIndex, endIndex);
  }, [activePage, filteredElements, pageSize, paginate]);

  const allSelected = useMemo(() => {
    return !!currentPageElements.length && currentPageElements.every(product => selection[product[mainKey]]);
  }, [currentPageElements, mainKey, selection]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isLoading) {
      if (activePage > pages) {
        setActivePage(1);
      }
      if (filters?.pageSize !== pageSize) {
        setPageSize(filters?.pageSize ?? DEFAULT_PAGE_SIZE);
      }
    }
  }, [hydrated, isLoading, filters?.pageSize, pageSize, pages, activePage]);

  useEffect(() => {
    const tableEl = tableRef.current;

    const conditionalPreventSend = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isTextInput = ['input', 'textarea'].includes(tag);
      if (isTextInput) {
        preventSend(e);
      }
    };

    if (tableEl) {
      tableEl.addEventListener('keydown', conditionalPreventSend);
    }

    return () => {
      if (tableEl) {
        tableEl.removeEventListener('keydown', conditionalPreventSend);
      }
    };
  }, []);


  const handlePageChange = (e, { activePage }) => {
    clearSelection?.();
    setFilters({ ...filters, page: activePage });
    setActivePage(activePage);
  };

  const handleToggleAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllCurrentPageElements(currentPageElements);
    }
  };

  const handlePageSizeChange = (e, { value }) => {
    setPageSize(value);
    setFilters({ ...filters, pageSize: value, page: 1 });
    setActivePage(1);
    clearSelection?.();
  };

  const handleShortcutPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setActivePage(newPage);
    }
  };

  useKeyboardShortcuts({
    [SHORTKEYS.RIGHT_ARROW]: () => handleShortcutPageChange(activePage + 1),
    [SHORTKEYS.LEFT_ARROW]: () => handleShortcutPageChange(activePage - 1),
  });

  return (
    <Container ref={tableRef} $tableHeight={$tableHeight}>
      {paginate && (
        <Pagination
          activePage={activePage}
          pageSize={pageSize}
          totalItems={filteredElements.length}
          totalPages={pages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
      <Loader active={isLoading} $greyColor>
        <Table sortable celled compact striped={!basic} color={color} definition={isSelectable}>
          <TableHeader fullWidth>
            <TableRow>
              {isSelectable && (
                <HeaderCell $width="50px" padding="0">
                  <CenteredFlex>
                    <Checkbox
                      indeterminate={!!Object.keys(selection).length && !allSelected}
                      checked={!isLoading && allSelected}
                      onChange={handleToggleAll}
                    />
                  </CenteredFlex>
                </HeaderCell>
              )}
              {headers.map((header) => (
                <HeaderCell
                  key={`header_${header.id}`}
                  $basic={basic}
                  sorted={sortConfig.key === header.key ? sortConfig.direction : null}
                  onClick={() => header.sortable && handleSort(header.key)}
                  style={{ cursor: header.sortable ? 'pointer' : 'default' }}
                >
                  {header.title}
                </HeaderCell>
              ))}
              {!!Object.keys(selection).length && (
                <ActionsContainer $header $open={isPopupOpen}>
                  <InnerActionsContainer $header>
                    <PopupActions
                      position="right center"
                      trigger={<Button icon circular color={COLORS.YELLOW} size="mini"><Icon name={ICONS.COG} /></Button>}
                      buttons={selectionActions}
                      open={isPopupOpen}
                      onOpen={() => setIsPopupOpen(true)}
                      onClose={() => setIsPopupOpen(false)}
                    />
                  </InnerActionsContainer>
                </ActionsContainer>
              )}
            </TableRow>
          </TableHeader>
          {hydrated && (
            <Table.Body>
              {!currentPageElements.length ? (
                <Table.Row>
                  <Cell colSpan={headers.length + (isSelectable ? 2 : 1)} textAlign="center">
                    <Header as="h4">
                      No se encontraron ítems
                    </Header>
                  </Cell>
                </Table.Row>
              ) : (
                currentPageElements.map((element, index) => {
                  if (page) {
                    const rowKey = typeof mainKey === "function" ? mainKey(element, index) : element[mainKey];
                    return (
                      <TableRow key={rowKey || index}>
                        {isSelectable && (
                          <Cell $basic={basic}>
                            <CenteredFlex>
                              <Checkbox
                                checked={!!selection[element[mainKey]]}
                                onChange={() => onSelectionChange(element)}
                              />
                            </CenteredFlex>
                          </Cell>
                        )}
                        {headers.map(header => (
                          <LinkCell
                            key={`cell_${header.id}_${element[mainKey]}`}
                            align={header.align}
                            width={header.width}
                            onClick={() => {
                              if (typeof page?.SHOW === "function") {
                                push(page.SHOW(element[mainKey], element));
                              }
                            }}
                          >
                            {header.value(element, index)}
                          </LinkCell>
                        ))}
                        {!!actions.length && (
                          <ActionsContainer $deleteButtonInside={$deleteButtonInside} $open={isPopupOpen}>
                            <InnerActionsContainer $deleteButtonInside={$deleteButtonInside}>
                              {actions.length > 1 ? (
                                <PopupActions
                                  open={popupOpenId === element[mainKey]}
                                  onOpen={() => setPopupOpenId(element[mainKey])}
                                  onClose={() => setPopupOpenId(null)}
                                  position="left center"
                                  trigger={<Button icon circular color={COLORS.BLUE} size="mini"><Icon name={ICONS.COG} /></Button>}
                                  buttons={actions.map((action, idx) => (
                                    <IconedButton
                                      key={`${action.icon}_${idx}`}
                                      icon={action.icon}
                                      color={action.color}
                                      onClick={() => action.onClick(element, index)}
                                      text={action.tooltip}
                                      width={action.width}
                                    />
                                  ))}
                                />
                              ) : (
                                <Actions actions={actions} element={element} />
                              )}
                            </InnerActionsContainer>
                          </ActionsContainer>
                        )}
                      </TableRow>
                    );
                  }
                  const rowKey = typeof mainKey === "function" ? mainKey(element, index) : element[mainKey];
                  return (
                    <TableRow key={rowKey || index}>
                      {headers.map(header => (
                        <Cell
                          key={`cell_${header.id}`}
                          align={header.align}
                          width={header.width}
                          $wrap={$wrap}
                          $basic={basic}
                        >
                          {header.value(element, index)}
                        </Cell>
                      ))}
                      {!!actions.length && (
                        <ActionsContainer $stillShow $deleteButtonInside={$deleteButtonInside} $open={isPopupOpen}>
                          <InnerActionsContainer $deleteButtonInside={$deleteButtonInside}>
                            {actions.length > 1 ? (
                              <PopupActions
                                open={popupOpenId === element[mainKey]}
                                onOpen={() => setPopupOpenId(element[mainKey])}
                                onClose={() => setPopupOpenId(null)}
                                position="left center"
                                trigger={<Button type="button" icon circular color={COLORS.ORANGE} size="mini"><Icon name={ICONS.COG} /></Button>}
                                buttons={actions.map((action, idx) => (
                                  <IconedButton
                                    key={`${action.icon}_${idx}`}
                                    icon={action.icon}
                                    color={action.color}
                                    onClick={() => action.onClick(element, index)}
                                    text={action.tooltip}
                                    width={action.width}
                                  />
                                ))}
                              />
                            ) : (
                              <Actions actions={actions} element={element} index={index} />
                            )}
                          </InnerActionsContainer>
                        </ActionsContainer>
                      )}
                    </TableRow>
                  );
                })
              )}
            </Table.Body>
          )}
        </Table>
        {onDownloadExcel && (
           <Flex width="100%" $justifyContent="flex-end" >
           <IconedButton
             text="Descargar Excel"
             icon={ICONS.FILE_EXCEL}
             onClick={() => onDownloadExcel(filteredElements)}
           />
         </Flex>
        )}
      </Loader>
    </Container>
  );
};

export default CustomTable;
