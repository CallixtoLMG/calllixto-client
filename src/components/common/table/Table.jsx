import { useRouter } from "next/navigation";
import { Table } from "semantic-ui-react";
import Actions from "./Actions";
import { ActionsContainer, HeaderCell, LinkRow } from "./styles";

const CustomTable = ({ headers = [], elements = [], page, actions = [] }) => {
  const { push } = useRouter();
  return (
    <Table celled compact striped>
      <Table.Header celled fullWidth>
        <Table.Row>
          {headers.map((header) => (
            <HeaderCell celled key={`header_${header.id}`} >{header.title}</HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {elements.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={headers.length} textAlign="center">
              No se encontraron ítems.
            </Table.Cell>
          </Table.Row>
        ) : (
          elements.map((element) => (
            page ? (
              <LinkRow key={element.key} onClick={() => push(page.SHOW(element.id))}>
                {headers.map((header) => header.value(element))}
                {!!actions.length && (
                  <ActionsContainer>
                    <Actions actions={actions} element={element} />
                  </ActionsContainer>
                )}
              </LinkRow>
            ) : (
              <Table.Row key={element.key}>
                {headers.map((header) => header.value(element))}
                {!!actions.length && (
                  <ActionsContainer>
                    <Actions actions={actions} />
                  </ActionsContainer>
                )}
              </Table.Row>
            )
          ))
        )}
      </Table.Body>
    </Table>
  );
};

export default CustomTable;
