import { useRouter } from "next/navigation";
import { Header, Table } from "semantic-ui-react";
import Actions from "./Actions";
import { ActionsContainer, Cell, HeaderCell, InnerActionsContainer, LinkRow } from "./styles";

const CustomTable = ({ headers = [], elements = [], page, actions = [] }) => {
  const { push } = useRouter();
  return (
    <Table celled compact striped>
      <Table.Header fullWidth>
        <Table.Row>
          {headers.map((header) => (
            <HeaderCell key={`header_${header.id}`} >{header.title}</HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {elements.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={headers.length} textAlign="center">
              <Header as="h4">
                No se encontraron ítems.
              </Header>
            </Table.Cell>
          </Table.Row>
        ) : (
          elements.map((element) => {
            if (page) {
              return (
                <LinkRow key={element.key} onClick={() => push(page.SHOW(element.id))}>
                  {headers.map(header => (
                    <Cell key={`cell_${header.id}`} align={header.align} width={header.width}>
                      {header.value(element)}
                    </Cell>
                  ))}
                  {!!actions.length && (
                    <ActionsContainer>
                      <InnerActionsContainer>
                        <Actions actions={actions} element={element} />
                      </InnerActionsContainer>
                    </ActionsContainer>
                  )}
                </LinkRow>
              );
            }
            return (
              <Table.Row key={element.key}>
                {headers.map(header => (
                    <Cell key={`cell_${header.id}`} align={header.align} width={header.width}>
                      {header.value(element)}
                    </Cell>
                  ))}
                {!!actions.length && (
                  <ActionsContainer>
                    <Actions actions={actions} />
                  </ActionsContainer>
                )}
              </Table.Row>
            );
          })
        )}
      </Table.Body>
    </Table>
  );
};

export default CustomTable;