import { Loader } from "@/components/layout";
import { COLORS, DEFAULT_PAGE_SIZE, ICONS, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Header, Icon } from "semantic-ui-react";
import { IconedButton, PopupActions } from "../buttons";
import { CenteredFlex } from "../custom";
import Actions from "./Actions";
import Pagination from "./Pagination";
import { ActionsContainer, Cell, Container, HeaderCell, InnerActionsContainer, LinkCell, Table, TableHeader, TableRow } from "./styles";

const CustomTable = ({
  isLoading,
  headers = [],
  elements = [],
  page,
  actions = [],
  mainKey = 'id',
  tableHeight,
  deleteButtonInside,
  color,
  selection = {},
  onSelectionChange,
  selectionActions = [],
  basic,
  $wrap,
  clearSelection,
  selectAllCurrentPageElements,
  paginate,
  onFilter = () => true,
}) => {
  const { push } = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isSelectable = useMemo(() => !!selectionActions.length, [selectionActions]);
  const [activePage, setActivePage] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupOpenId, setPopupOpenId] = useState(null);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const filteredElements = useMemo(() => elements.filter(onFilter), [elements, onFilter]);
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
    if (activePage > pages) {
      setActivePage(1);
    }
  }, [pages, activePage]);

  const handlePageChange = (e, { activePage }) => {
    clearSelection?.();
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
    <Container tableHeight={tableHeight}>
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
      <Table celled compact striped={!basic} color={color} definition={isSelectable}>
        <TableHeader fullWidth>
          <TableRow>
            {isSelectable && (
              <HeaderCell width="50px" padding="0">
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
              <HeaderCell key={`header_${header.id}`} $basic={basic}>{header.title}</HeaderCell>
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
          <Loader active={isLoading} $greyColor>
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
                    return (
                      <TableRow key={element[mainKey]}>
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
                            key={`cell_${header.id}`} align={header.align}
                            width={header.width} onClick={() => push(page.SHOW(element[mainKey]))}
                          >
                            {header.value(element, index)}
                          </LinkCell>
                        ))}
                        {!!actions.length && (
                          <ActionsContainer deleteButtonInside={deleteButtonInside} $open={isPopupOpen}>
                            <InnerActionsContainer deleteButtonInside={deleteButtonInside}>
                              {actions.length > 1 ? (
                                <PopupActions
                                  open={popupOpenId === element[mainKey]}
                                  onOpen={() => setPopupOpenId(element[mainKey])}
                                  onClose={() => setPopupOpenId(null)}
                                  position="left center"
                                  trigger={<Button icon circular color={COLORS.BLUE} size="mini"><Icon name={ICONS.COG} /></Button>}
                                  buttons={actions.map((action, idx) => (
                                    <IconedButton
                                      key={idx}
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
                  return (
                    <TableRow key={element[mainKey]}>
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
                        <ActionsContainer stillShow deleteButtonInside={deleteButtonInside} $open={isPopupOpen}>
                          <InnerActionsContainer deleteButtonInside={deleteButtonInside}>
                            {actions.length > 1 ? (
                              <PopupActions
                                open={popupOpenId === element[mainKey]}
                                onOpen={() => setPopupOpenId(element[mainKey])}
                                onClose={() => setPopupOpenId(null)}
                                position="left center"
                                trigger={<Button type="button" icon circular color={COLORS.ORANGE} size="mini"><Icon name={ICONS.COG} /></Button>}
                                buttons={actions.map((action, idx) => (
                                  <IconedButton
                                    key={idx}
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
          </Loader>
        )}
      </Table>
    </Container>
  );
};

export default CustomTable;
