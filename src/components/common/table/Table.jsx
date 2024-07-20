import { Loader } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Header, Icon } from "semantic-ui-react";
import { PopupActions } from "../buttons";
import Actions from "./Actions";
import { ActionsContainer, Cell, Container, HeaderCell, InnerActionsContainer, LinkCell, Table, TableHeader, TableRow } from "./styles";
import { CenteredFlex } from "../custom";

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
  selectAll
}) => {
  const { push } = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isSelectable = useMemo(() => !!selectionActions.length, [selectionActions]);
  const allSelected = useMemo(() => Object.keys(selection)?.length === elements.length, [selection, elements]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleToggleAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  return (
    <Container tableHeight={tableHeight}>
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
              <ActionsContainer $header>
                <InnerActionsContainer $header>
                  <PopupActions
                    position="right center"
                    trigger={<Button icon circular color="yellow" size="mini"><Icon name="cog" /></Button>}
                    buttons={selectionActions}
                  />
                </InnerActionsContainer>
              </ActionsContainer>
            )}
          </TableRow>
        </TableHeader>
        {hydrated && (
          <Loader active={isLoading} $greyColor>
            <Table.Body>
              {!elements.length ? (
                <Table.Row>
                  <Cell colSpan={headers.length + (isSelectable ? 2 : 1)} textAlign="center">
                    <Header as="h4">
                      No se encontraron ítems
                    </Header>
                  </Cell>
                </Table.Row>
              ) : (
                elements.map((element, index) => {
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
                        {!!selectionActions.length && (
                          <ActionsContainer deleteButtonInside={deleteButtonInside}>
                            <InnerActionsContainer deleteButtonInside={deleteButtonInside}>
                              <Actions actions={actions} element={element} />
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
                        <ActionsContainer deleteButtonInside={deleteButtonInside}>
                          <InnerActionsContainer deleteButtonInside={deleteButtonInside}>
                            <Actions actions={actions} element={element} index={index} />
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
