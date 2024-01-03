import { Button } from "@/components/common/custom";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Flex } from 'rebass';
import { Form, Header, Icon, Input, Popup, Segment, Table } from "semantic-ui-react";
import styled from "styled-components";
import Actions from "./Actions";
import { ActionsContainer, Cell, HeaderCell, InnerActionsContainer, LinkRow } from "./styles";

const FiltersContainer = styled(Flex)`
  column-gap: 10px;
  align-items: center;
`;

const CustomTable = ({ headers = [], elements = [], page, actions = [], total, filters = [] }) => {
  const { push } = useRouter();
  const defaultValues = useMemo(() => filters.reduce((acc, filter) => ({ ...acc, [filter.value]: '' }), {}), [filters]);
  const { handleSubmit, control, reset } = useForm({ defaultValues });
  const [filteredElements, setFilteredElements] = useState(elements);

  const filter = useCallback((data) => {
    console.log(data)
    const newElements = elements.filter(element => {
      return Object.entries(data).every(([key, value]) => {
        const keys = key.split('.');
        const nestedValue = keys.reduce((acc, nestedKey) => acc && acc[nestedKey], element);
  
        const stringValue = (nestedValue !== undefined && nestedValue !== null) ? String(nestedValue).toLowerCase() : '';
  
        return stringValue.includes(String(value).toLowerCase());
      });
    });
    setFilteredElements(newElements);
  }, [elements]);

  const handleRestore = useCallback(() => {
    reset(defaultValues);
    setFilteredElements(elements);
  }, [reset, defaultValues, elements]);

  return (
    <>
      {filters.length > 0 && (
        <Segment>
          <Form onSubmit={handleSubmit(filter)}>
            <Flex justifyContent="space-between">
              <FiltersContainer>
                <Popup
                  content="Restaurar filtros"
                  position="top center"
                  size="tiny"
                  trigger={(
                    <Box>
                      <Button circular icon type="button" onClick={handleRestore} size="mini">
                        <Icon name="undo" />
                      </Button>
                    </Box>
                  )}
                />
                {filters.map(filter =>
                  <Controller
                    key={`filter_${filter.value}`}
                    name={filter.value}
                    control={control}
                    render={({ field }) => (<Input {...field} placeholder={filter.placeholder} />)}
                  />
                )}
              </FiltersContainer>
              <Button type="submit" width="110px">
                <Flex justifyContent="space-around">
                  <span>Filtrar</span>
                  <Icon name="search" />
                </Flex>
              </Button>
            </Flex>
          </Form>
        </Segment>
      )}
      <Table celled compact striped>
        <Table.Header fullWidth>
          <Table.Row>
            {headers.map((header) => (
              <HeaderCell key={`header_${header.id}`} >{header.title}</HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredElements.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={headers.length} textAlign="center">
                <Header as="h4">
                  No se encontraron ítems.
                </Header>
              </Table.Cell>
            </Table.Row>
          ) : (
            filteredElements.map((element) => {
              if (page) {
                return (
                  <LinkRow key={element.key} onClick={() => push(page.page.SHOW(element[page.key || 'id']))}>
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
        {total && (
          <Table.Footer celled fullWidth>
            <Table.Row>
              <HeaderCell textAlign="right" colSpan={headers.length - 1}><strong>TOTAL</strong></HeaderCell>
              <HeaderCell colSpan="1"><strong>{total}</strong></HeaderCell>
            </Table.Row>
          </Table.Footer>
        )}
      </Table>
    </>
  );
};

export default CustomTable;