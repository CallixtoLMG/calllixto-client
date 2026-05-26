import { POPUP_POSITIONS, CONTENT_SIZES, COLORS, DEFAULT_PAGE_SIZE, ICONS, SHORTKEYS, SIZES, SORTING } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { Loader } from "@/components/layout";
import { useKeyboardShortcuts } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Checkbox, Header, Popup } from "semantic-ui-react";
import { IconedButton, PopupActions } from "../buttons";
import { CenteredFlex, Flex, Icon } from "../custom";
import Actions from "./Actions";
import Pagination from "./Pagination";

import { ActionsContainer, Cell, Container, HeaderCell, InnerActionsContainer, LinkCell, LinkContent, LinkOverlay, Table, TableHeader, TableRow } from "./styles";
const { ASC, DESC } = SORTING;

const CustomTable = ({
  isLoading,
  headers = [],
  elements = [],
  page,
  actions = [],
  mainKey = 'id',
  $tableHeight,
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
  onDownloadExcel,
  disableDefaultPageLink = false,
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

  const resolveActionProp = (prop, element, index) => {
    return typeof prop === "function" ? prop(element, index) : prop;
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
      <Loader $marginTop active={isLoading} $greyColor>
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
                  {!!Object.keys(selection).length && (
                    <ActionsContainer as="div" $header $open={isPopupOpen}>
                      <InnerActionsContainer $header>
                        <PopupActions
                          position={POPUP_POSITIONS.RIGHT_CENTER}
                          trigger={<Button icon circular color={COLORS.YELLOW} size="mini"><Icon name={ICONS.COG} /></Button>}
                          buttons={selectionActions}
                          open={isPopupOpen}
                          onOpen={() => setIsPopupOpen(true)}
                          onClose={() => setIsPopupOpen(false)}
                        />
                      </InnerActionsContainer>
                    </ActionsContainer>
                  )}
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
              {!!actions.length && (
                <HeaderCell $cursor="default" $width="52px" padding="0">
                  <CenteredFlex>
                    <Popup
                      size={SIZES.TINY}
                      content="Acciones"
                      position={POPUP_POSITIONS.TOP_CENTER}
                      trigger={<Icon $height={CONTENT_SIZES.FIT} name={ICONS.COG} color={COLORS.GREY} />}
                    />
                  </CenteredFlex>
                </HeaderCell>
              )}
            </TableRow>
          </TableHeader>
          {hydrated && (
            <Table.Body>
              {!currentPageElements.length ? (
                <Table.Row>
                  <Cell colSpan={headers.length + (isSelectable ? 1 : 0) + (actions.length ? 1 : 0)} textAlign="center">
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
                      <TableRow key={rowKey || index} data-testid="table-row" data-row-id={rowKey || ""}>
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
                        {headers.map(header => {
                          const href =
                            typeof header.href === "function"
                              ? header.href(element)
                              : header.href
                                ? header.href
                                : (
                                  !disableDefaultPageLink &&
                                    typeof page?.SHOW === "function" &&
                                    element[mainKey]
                                    ? page.SHOW(element[mainKey], element)
                                    : undefined
                                );

                          return (
                            <LinkCell
                              key={`cell_${header.id}_${element[mainKey]}`}
                              align={header.align}
                              width={header.width}
                              $whiteSpace={header.whiteSpace}
                            >
                              {href && (
                                <LinkOverlay
                                  href={href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    push(href);
                                  }}
                                />
                              )}
                              <LinkContent
                                data-href={href || ""}
                                data-clickable={!!href}
                                data-testid={`table-cell-${header.key || header.id}`}
                              >
                                {header.value(element, index)}
                              </LinkContent>
                            </LinkCell>
                          );
                        })}
                        {!!actions.length && (
                          <ActionsContainer>
                            <InnerActionsContainer $open={popupOpenId === element[mainKey]}>
                              {actions.length > 1 ? (
                                <PopupActions
                                  open={popupOpenId === element[mainKey]}
                                  onOpen={() => setPopupOpenId(element[mainKey])}
                                  onClose={() => setPopupOpenId(null)}
                                  position={POPUP_POSITIONS.LEFT_CENTER}
                                  trigger={<Button type="button" data-testid="table-row-actions-trigger" icon circular color={COLORS.BLUE} size="mini"><Icon name={ICONS.COG} /></Button>}
                                  buttons={actions.map((action, idx) => {
                                    const resolvedIcon = resolveActionProp(action.icon, element, index);
                                    const resolvedColor = resolveActionProp(action.color, element, index);
                                    const resolvedTooltip = resolveActionProp(action.tooltip, element, index);
                                    const resolvedWidth = resolveActionProp(action.width, element, index);
                                    const resolvedDisabled = resolveActionProp(action.disabled, element, index);
                                    const resolvedLoading = resolveActionProp(action.loading, element, index);
                                    const resolvedBasic = resolveActionProp(action.basic, element, index);
                                    const resolvedText = resolveActionProp(action.text, element, index);

                                    return (
                                      <IconedButton
                                        key={`${String(resolvedIcon)}_${idx}`}
                                        icon={resolvedIcon}
                                        color={resolvedColor}
                                        onClick={() => action.onClick(element, index)}
                                        text={resolvedText || resolvedTooltip}
                                        width={resolvedWidth}
                                        disabled={resolvedDisabled}
                                        loading={resolvedLoading}
                                        basic={resolvedBasic}
                                        iconOnly={action.iconOnly}
                                        dataTestId={`table-row-action-${action.id}`}
                                      />
                                    );
                                  })}
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
                    <TableRow key={rowKey || index} data-testid="table-row" data-row-id={rowKey || ""}>
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
                        <ActionsContainer>
                          <InnerActionsContainer $open={popupOpenId === element[mainKey]}>
                            {actions.length > 1 ? (
                              <PopupActions
                                open={popupOpenId === element[mainKey]}
                                onOpen={() => setPopupOpenId(element[mainKey])}
                                onClose={() => setPopupOpenId(null)}
                                position={POPUP_POSITIONS.LEFT_CENTER}
                                trigger={<Button type="button" data-testid="table-row-actions-trigger" icon circular color={COLORS.ORANGE} size="mini"><Icon name={ICONS.COG} /></Button>}
                                buttons={actions.map((action, idx) => {
                                  const resolvedIcon = resolveActionProp(action.icon, element, index);
                                  const resolvedColor = resolveActionProp(action.color, element, index);
                                  const resolvedTooltip = resolveActionProp(action.tooltip, element, index);
                                  const resolvedWidth = resolveActionProp(action.width, element, index);
                                  const resolvedDisabled = resolveActionProp(action.disabled, element, index);
                                  const resolvedLoading = resolveActionProp(action.loading, element, index);
                                  const resolvedBasic = resolveActionProp(action.basic, element, index);
                                  const resolvedText = resolveActionProp(action.text, element, index);
                                  return (
                                    <IconedButton
                                      key={`${String(resolvedIcon)}_${idx}`}
                                      icon={resolvedIcon}
                                      color={resolvedColor}
                                      onClick={() => action.onClick(element, index)}
                                      text={resolvedText || resolvedTooltip}
                                      width={resolvedWidth}
                                      disabled={resolvedDisabled}
                                      loading={resolvedLoading}
                                      basic={resolvedBasic}
                                      iconOnly={action.iconOnly}
                                      dataTestId={`table-row-action-${action.id}`}
                                    />
                                  );
                                })}
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
          <Flex width={CONTENT_SIZES.FIT} $alignSelf="flex-end">
            <IconedButton
              text="Descargar excel"
              icon={ICONS.FILE_EXCEL}
              onClick={() => onDownloadExcel(filteredElements)}
              width={CONTENT_SIZES.FIT}
            />
          </Flex>
        )}
      </Loader>
    </Container>
  );
};

export default CustomTable;
