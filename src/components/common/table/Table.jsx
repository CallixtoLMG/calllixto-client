import { Loader } from "@/components/layout";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Header, Icon, Pagination } from "semantic-ui-react";
import { IconnedButton, PopupActions } from "../buttons";
import { CenteredFlex } from "../custom";
import Actions from "./Actions";
import { ActionsContainer, Cell, Container, HeaderCell, InnerActionsContainer, LinkCell, PaginationContainer, Table, TableHeader, TableRow } from "./styles";

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
  selectAll,
  paginate,
  onFilter = () => true,
}) => {
  const { push } = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isSelectable = useMemo(() => !!selectionActions.length, [selectionActions]);
  const allSelected = useMemo(() => Object.keys(selection)?.length === elements.length, [selection, elements]);

  const [activePage, setActivePage] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const filteredElements = useMemo(() => elements.filter(onFilter), [elements, onFilter]);
  const pages = useMemo(() => Math.ceil(filteredElements.length / DEFAULT_PAGE_SIZE), [filteredElements]);
  const currentPageElements = useMemo(() => {
    const startIndex = (activePage - 1) * DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + DEFAULT_PAGE_SIZE;
    return filteredElements.slice(startIndex, endIndex);
  }, [activePage, filteredElements]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    setActivePage(1);
  }, [filteredElements]);

  const handleToggleAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  return (
    <Container tableHeight={tableHeight}>
      {paginate && (
        <PaginationContainer>
          <Pagination
            activePage={activePage}
            onPageChange={(e, { activePage }) => setActivePage(activePage)}
            siblingRange={2}
            boundaryRange={2}
            firstItem={null}
            lastItem={null}
            pointing
            secondary
            totalPages={pages}
          />
        </PaginationContainer>
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
                    trigger={<Button icon circular color="yellow" size="mini"><Icon name="cog" /></Button>}
                    buttons={selectionActions}
                    onToggleOpen={setIsPopupOpen}
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
                                  position="left center"
                                  trigger={<Button icon circular color="blue" size="mini"><Icon name="cog" /></Button>}
                                  buttons={actions.map((action, idx) => (
                                    <IconnedButton
                                      key={idx}
                                      icon={action.icon}
                                      color={action.color}
                                      onClick={() => action.onClick(element, index)}
                                      text={action.tooltip}
                                      width={action.width}
                                    />
                                  ))}
                                  onToggleOpen={setIsPopupOpen}
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
                        <ActionsContainer deleteButtonInside={deleteButtonInside} $open={isPopupOpen}>
                          <InnerActionsContainer deleteButtonInside={deleteButtonInside}>
                            {actions.length > 1 ? (
                              <PopupActions
                                position="left center"
                                trigger={<Button type="button" icon circular color="orange" size="mini"><Icon name="cog" /></Button>}
                                buttons={actions.map((action, idx) => (
                                  <IconnedButton
                                    key={idx}
                                    icon={action.icon}
                                    color={action.color}
                                    onClick={() => action.onClick(element, index)}
                                    text={action.tooltip}
                                    width={action.width}
                                  />
                                ))}
                                onToggleOpen={setIsPopupOpen}
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
