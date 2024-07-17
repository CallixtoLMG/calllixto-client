import { Loader } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Header, Icon } from "semantic-ui-react";
import { PopupActions } from "../buttons";
import { Dropdown } from "../custom";
import Actions from "./Actions";
import { ActionsContainer, Cell, CheckboxContainer, Container, HeaderCell, InnerActionsContainer, LinkCell, Table, TableHeader, TableRow } from "./styles";

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
  clearSelection, 
  selectAll
}) => {
  const { push } = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isSelectable = useMemo(() => !!selectionActions.length, [selectionActions]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleToggleAll = () => {
    const allSelected = Object.keys(selection).length === elements.length;

    if (allSelected) {
      clearSelection();
    } else {
      selectAll();
    }
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
        clearSelection()
      }
    }
  ];

  return (
    <Container tableHeight={tableHeight}>
      <Table celled compact striped={!basic} color={color} definition={isSelectable}>
        <TableHeader fullWidth>
          <TableRow>
            {isSelectable && (
              <HeaderCell width="65px" padding="0">
                <CheckboxContainer selection={Object.keys(selection).length}>
                  <Checkbox
                    indeterminate={Object.keys(selection).length > 0 && Object.keys(selection).length < elements.length}
                    checked={!isLoading && Object.keys(selection).length === elements.length}
                    onChange={handleToggleAll}
                  />
                  {!!Object.keys(selection).length &&
                    <Dropdown
                      padding="3px"
                      bgColor="rgb(238, 238, 238)"
                      hideBorder
                      width="fit-content"
                      margin="0"
                      height="30px"
                      icon="caret down"
                      button
                      className='icon'
                      options={dropdownOptions}
                      trigger={<></>}
                    />}
                </CheckboxContainer>
              </HeaderCell>
            )}
            {headers.map((header) => (
              <HeaderCell key={`header_${header.id}`} basic={basic}>{header.title}</HeaderCell>
            ))}
            {isSelectable && !!Object.keys(selection).length && (
              <ActionsContainer header >
                <InnerActionsContainer header>
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
          <Loader active={isLoading}>
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
