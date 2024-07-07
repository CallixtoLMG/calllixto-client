import { Loader } from "@/components/layout";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Header, Icon } from "semantic-ui-react";
import Actions from "./Actions";
import { ActionsContainer, Cell, Container, HeaderCell, InnerActionsContainer, Table, TableHeader, TableRow, LinkCell } from "./styles";
import { useEffect, useMemo, useState } from "react";
import { PopupActions } from "../buttons";

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
  selectable,
  selection,
  onSelectionChange,
  selectionActions = [],
}) => {
  const { push } = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isSelectable = useMemo(() => selectable && !!selectionActions.length, [selectable, selectionActions]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Container tableHeight={tableHeight}>
      <Table celled compact striped color={color} definition={isSelectable}>
        <TableHeader fullWidth>
          <Table.Row>
            {isSelectable && (
              <HeaderCell>
                {!!Object.keys(selection).length && (
                  <PopupActions
                    position="right center"
                    trigger={<Button icon="bolt" circular color="yellow" size="mini" />}
                    buttons={selectionActions}
                  />
                )}
              </HeaderCell>
            )}
            {headers.map((header) => (
              <HeaderCell key={`header_${header.id}`} >{header.title}</HeaderCell>
            ))}
          </Table.Row>
        </TableHeader>
        {hydrated && (
          <Loader active={isLoading}>
            <Table.Body>
              {!elements.length ? (
                <Table.Row>
                  <Cell colSpan={headers.length} textAlign="center">
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
                          <Cell>
                            <Checkbox
                              checked={!!selection[element[mainKey]]}
                              onChange={() => onSelectionChange(element[mainKey])}
                            />
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
                        <Cell key={`cell_${header.id}`} align={header.align} width={header.width}>
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