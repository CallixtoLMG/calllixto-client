import { ButtonsContainer, Input } from "@/components/common/custom";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { Loader } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Flex } from 'rebass';
import { Form, Header, Icon, Popup } from "semantic-ui-react";
import styled from "styled-components";
import Actions from "./Actions";

import { ActionsContainer, Button, Cell, Container, HeaderCell, InnerActionsContainer, LinkRow, PaginationContainer, PaginationSegment, Segment, Table, TableHeader, TableRow } from "./styles";

const FiltersContainer = styled(Flex)`
  column-gap: 10px;
  align-items: center;
`;

const CustomTable = ({ isRefetching, isLoading, onFilter, headers = [], elements = [], page, actions = [], total, filters = [], mainKey = 'id', tableHeight, deleteButtonInside }) => {
  const { push } = useRouter();
  const defaultValues = useMemo(() => filters.reduce((acc, filter) => ({ ...acc, [filter.value]: '' }), {}), [filters]);
  const { handleSubmit, control, reset, setValue } = useForm({ defaultValues });
  const useFilters = useMemo(() => filters.length > 0, [filters]);
  const { goToNextPage, goToPreviousPage, currentPage, resetFilters, canGoNext } = usePaginationContext();

  const handleFilterChange = useCallback((changedFilter) => {
    filters.forEach(filter => {
      if (filter.value !== changedFilter) {
        setValue(filter.value, '');
      }
    });
  }, [filters, setValue]);

  const handleRestore = useCallback(() => {
    resetFilters();
    reset(defaultValues);
  }, [resetFilters, reset, defaultValues]);

  const handleEnterKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(onFilter)();
    }
  };

  return (
    <>
      <Flex>
        {useFilters && (
          <Segment>
            <Form onSubmit={handleSubmit(onFilter)}>
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
                      render={({ field }) => (
                        <Input
                          onKeyPress={handleEnterKeyPress}
                          height="35px"
                          margin="0"
                          {...field}
                          onChange={e => {
                            handleFilterChange(filter.value);
                            field.onChange(e);
                          }}
                          placeholder={filter.placeholder} />)}
                    />
                  )}
                </FiltersContainer>
                <Button onClick={handleSubmit(onFilter)} type="button" width="110px">
                  <Flex justifyContent="space-around">
                    <span>Filtrar</span>
                    <Icon name="search" />
                  </Flex>
                </Button>
              </Flex>
            </Form>
          </Segment>
        )}
        <PaginationContainer height="50px">
          <ButtonsContainer width="400px" center >
            <Button onClick={goToPreviousPage} disabled={currentPage === 0}>Anterior</Button>
            <PaginationSegment height="50px">{Number(currentPage) + 1}</PaginationSegment>
            <Button onClick={goToNextPage} disabled={!canGoNext}>Siguiente</Button>
          </ButtonsContainer>
        </PaginationContainer>
      </Flex>
      <Loader active={isLoading | isRefetching}>
        <Container tableHeight={tableHeight}>
          <Table celled compact striped>
            <TableHeader fullWidth>
              <Table.Row>
                {headers.map((header) => (
                  <HeaderCell key={`header_${header.id}`} >{header.title}</HeaderCell>
                ))}
              </Table.Row>
            </TableHeader>
            <Table.Body>
              {!elements.length ? (
                <Table.Row>
                  <Table.Cell colSpan={headers.length} textAlign="center">
                    <Header as="h4">
                      No se encontraron ítems.
                    </Header>
                  </Table.Cell>
                </Table.Row>
              ) : (
                elements.map((element, index) => {
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
        </Container>
      </Loader>
    </>
  );
};

export default CustomTable;