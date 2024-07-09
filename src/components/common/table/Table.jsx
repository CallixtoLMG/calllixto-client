import { Loader } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "semantic-ui-react";
import Actions from "./Actions";
import { ActionsContainer, Cell, Container, HeaderCell, InnerActionsContainer, LinkRow, Table, TableHeader, TableRow } from "./styles";

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
  basic,
  $wrap
}) => {
  const { push } = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Container tableHeight={tableHeight}>
      <Table celled compact striped={!basic} color={color}>
        <TableHeader fullWidth>
          <Table.Row>
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
                  <Table.Cell colSpan={headers.length} textAlign="center">
                    <Header as="h4">
                      No se encontraron ítems
                    </Header>
                  </Table.Cell>
                </Table.Row>
              ) : (
                elements.map((element, index) => {
                  if (page) {
                    return (
                      <LinkRow key={element[mainKey]} onClick={() => push(page.SHOW(element[mainKey]))}>
                        {headers.map(header => (
                          <Cell $wrap={$wrap} key={`cell_${header.id}`} align={header.align} width={header.width}>
                            {header.value(element, index)}
                          </Cell>
                        ))}
                        {!!actions.length && (
                          <ActionsContainer deleteButtonInside={deleteButtonInside}>
                            <InnerActionsContainer deleteButtonInside={deleteButtonInside}>
                              <Actions actions={actions} element={element} />
                            </InnerActionsContainer>
                          </ActionsContainer>
                        )}
                      </LinkRow>
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