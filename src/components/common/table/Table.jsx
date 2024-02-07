import { Button, Input, Segment, } from "@/components/common/custom";
import { get } from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Flex } from 'rebass';
import { Form, Header, Icon, Popup } from "semantic-ui-react";
import styled from "styled-components";
import Actions from "./Actions";
import { ActionsContainer, Cell, Contenedor, HeaderCell, InnerActionsContainer, LinkRow, Table, TableHeader, TableRow } from "./styles";

const FiltersContainer = styled(Flex)`
  column-gap: 10px;
  align-items: center;
`;

const CustomTable = ({ headers = [], elements = [], page, actions = [], total, filters = [], mainKey = 'id', tableHeight, deleteButtonInside }) => {
  console.log(tableHeight)
  const { push } = useRouter();
  const defaultValues = useMemo(() => filters.reduce((acc, filter) => ({ ...acc, [filter.value]: '' }), {}), [filters]);
  const { handleSubmit, control, reset } = useForm({ defaultValues });
  const [filteredElements, setFilteredElements] = useState([]);
  const useFilters = useMemo(() => filters.length > 0, [filters]);

  const filter = useCallback((data) => {
    const newElements = elements.filter(element => {
      if (data) {
        return filters.every(filter => {
          return get(element, filter.map ? filter.map : filter.value, '')?.toLowerCase().includes(data[filter.value].toLowerCase());
        });
      }
      return elements;
    });
    setFilteredElements(newElements);
  }, [elements, filters]);

  useEffect(() => {
    setFilteredElements(elements);
  }, [elements])

  const handleRestore = useCallback(() => {
    reset(defaultValues);
    setFilteredElements(elements);
  }, [reset, defaultValues, elements]);

  return (
    <>
      {useFilters && (
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
                    render={({ field }) => (<Input height="35px" margin="0" {...field} placeholder={filter.placeholder} />)}
                  />
                )}
              </FiltersContainer>
              <Button onClick={handleSubmit(filter)} type="button" width="110px">
                <Flex justifyContent="space-around">
                  <span>Filtrar</span>
                  <Icon name="search" />
                </Flex>
              </Button>
            </Flex>
          </Form>
        </Segment>
      )}
      <Contenedor tableHeight={tableHeight}>
        <Table celled compact striped>
          <TableHeader fullWidth>
            <Table.Row>
              {headers.map((header) => (
                <HeaderCell key={`header_${header.id}`} >{header.title}</HeaderCell>
              ))}
            </Table.Row>
          </TableHeader>
          <Table.Body>
            {!elements.length && !filteredElements.length ? (
              <Table.Row>
                <Table.Cell colSpan={headers.length} textAlign="center">
                  <Header as="h4">
                    No se encontraron ítems.
                  </Header>
                </Table.Cell>
              </Table.Row>
            ) : (
              (useFilters ? filteredElements : elements).map((element, index) => {
                if (page) {
                  return (
                    <LinkRow key={element[mainKey]} onClick={() => push(page.SHOW(element[mainKey]))}>
                      {headers.map(header => (
                        <Cell key={`cell_${header.id}`} align={header.align} width={header.width}>
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
          {total && (
            <Table.Footer celled fullWidth>
              <Table.Row>
                <HeaderCell textAlign="right" colSpan={headers.length - 1}><strong>TOTAL</strong></HeaderCell>
                <HeaderCell colSpan="1"><strong>{total}</strong></HeaderCell>
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
      </Contenedor>
    </>
  );
};

export default CustomTable;