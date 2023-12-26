import { ActionsContainer, HeaderCell, LinkRow } from "./styles";
import { Table } from "semantic-ui-react";
import { useRouter } from "next/navigation";
import Actions from "./Actions";

const CustomTable = ({ headers = [], elements = [], page, actions = [] }) => {
  const { push } = useRouter();
  return (
    <Table celled compact striped>
      <Table.Header fullWidth>
        {headers.map((header) => (
          <HeaderCell key={`header_${header.id}`} >{header.title}</HeaderCell>
        ))}
      </Table.Header>
      <Table.Body>
        {elements.map((element) => {
          if (page) {
            return (
              <>
                <LinkRow key={element.key} onClick={() => push(page.SHOW(element.id))}>
                  {headers.map((header) => header.value(element))}
                  {!!actions.length && (
                    <ActionsContainer>
                      <Actions actions={actions} element={element} />
                    </ActionsContainer>
                  )}
                </LinkRow>
              </>
            )
          }
          return (
            <Table.Row key={element.key}>
              {headers.map((header) => header.value(element))}
              {!!actions.length && (
                <ActionsContainer>
                  <Actions actions={actions} />
                </ActionsContainer>
              )}
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  );
};

export default CustomTable;