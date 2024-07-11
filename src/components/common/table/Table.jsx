import { Loader } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Dropdown, Header, Icon } from "semantic-ui-react";
import { PopupActions } from "../buttons";
import Actions from "./Actions";
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
  selection,
  onSelectionChange,
  selectionActions = [],
  basic,
  $wrap,
  clearSelection // Recibir clearSelection como prop
}) => {
  const { push } = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isSelectable = useMemo(() => !!selectionActions.length, [selectionActions]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleToggleAll = () => {
    const someSelected = Object.keys(selection).length > 0;
    elements.forEach(element => onSelectionChange(element[mainKey], !someSelected));
  };

  const dropdownOptions = [
    {
      key: 'all',
      text: 'Seleccionar todo',
      onClick: () => {
        elements.forEach(element => {
          if (!selection[element[mainKey]]) {
            onSelectionChange(element[mainKey], true);
          }
        });
      }
    },
    {
      key: 'none',
      text: 'Deseleccionar todo',
      onClick: () => {
        elements.forEach(element => {
          if (selection[element[mainKey]]) {
            onSelectionChange(element[mainKey], false);
          }
        });
      }
    }
  ];

  return (
    <Container tableHeight={tableHeight}>
      <Button onClick={clearSelection} color="red">Deseleccionar Todo</Button>
      <Table celled compact striped={!basic} color={color} definition={isSelectable}>
        <TableHeader fullWidth>
          <Table.Row>
            {isSelectable && (
              <HeaderCell width="65px" padding="0">
                <Checkbox
                  indeterminate={Object.keys(selection).length > 0 && Object.keys(selection).length < elements.length}
                  checked={Object.keys(selection).length === elements.length}
                  onChange={handleToggleAll}
                />
                {!!Object.keys(selection).length && (
                  <PopupActions
                    position="right center"
                    trigger={<Button icon circular color="yellow" size="mini"><Icon name="cog" /></Button>}
                    buttons={selectionActions}
                  />
                )}
                <Dropdown
                  icon="caret down"
                  floating
                  labeled
                  button
                  className='icon'
                  options={dropdownOptions}
                  trigger={<></>}
                />
              </HeaderCell>
            )}
            {headers.map((header) => (
              <HeaderCell key={`header_${header.id}`} basic={basic}>{header.title}</HeaderCell>
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
                        <Cell $wrap={$wrap} key={`cell_${header.id}`} align={header.align} width={header.width}>
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
