import { CurrencyFormatInput, Input } from "@/components/common/custom";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { Loader } from "@/components/layout";
import { formatedPercentage, getTotalSumWithDiscountt, handleEnterKeyPress } from '@/utils';
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Flex } from 'rebass';
import { Form, Header, Icon, Popup } from "semantic-ui-react";
import Actions from "./Actions";
import { ActionsContainer, Button, Cell, Container, FiltersContainer, FooterCell, HeaderCell, HeaderContainer, HeaderSegment, InnerActionsContainer, LinkRow, PaginationContainer, PaginationSegment, Table, TableHeader, TableRow } from "./styles";
const CustomTable = ({ readOnly, pag, isRefetching, isLoading, onFilter, onManuallyRestore, headers = [], elements = [], page, actions = [], total, filters = [], mainKey = 'id', tableHeight, deleteButtonInside, globalDiscount, setGlobalDiscount }) => {
  const { push } = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

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
    onManuallyRestore && onManuallyRestore();
  }, [resetFilters, reset, defaultValues, onManuallyRestore]);

  const handleFilter = (e) => {
    handleSubmit(onFilter)();
  };

  const onKeyPress = (e) => handleEnterKeyPress(e, handleFilter);

  return (
    <>
      {useFilters && (
        <HeaderContainer>
          <HeaderSegment flex="75%">
            <Form onSubmit={handleSubmit(onFilter)}>
              <Flex justifyContent="space-between">
                <FiltersContainer>
                  <Popup
                    content={
                      <>
                        Restaurar filtros
                        <br />
                        y página.
                      </>
                    }
                    position="top center"
                    size="tiny"
                    trigger={(
                      <Button circular icon type="button" onClick={handleRestore}>
                        <Icon name="undo" />
                      </Button>
                    )}
                  />
                  {filters.map(filter =>
                    <Controller
                      key={`filter_${filter.value}`}
                      name={filter.value}
                      control={control}
                      render={({ field }) => (
                        <Input
                          onKeyPress={onKeyPress}
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
                <Button marginLeft="10px" onClick={handleSubmit(onFilter)} type="button" width="110px">
                  <Flex justifyContent="space-around">
                    <span>Filtrar</span>
                    <Icon name="search" />
                  </Flex>
                </Button>
              </Flex>
            </Form>
          </HeaderSegment>
          {pag &&
            <HeaderSegment flex="25%">
              <PaginationContainer >
                <Button onClick={goToPreviousPage} disabled={currentPage === 0}>Anterior</Button>
                <PaginationSegment >{Number(currentPage) + 1}</PaginationSegment>
                <Button onClick={goToNextPage} disabled={!canGoNext}>Siguiente</Button>
              </PaginationContainer>
            </HeaderSegment>}
        </HeaderContainer>
      )}
      <Container tableHeight={tableHeight}>
        <Table celled compact striped>
          <TableHeader fullWidth>
            <Table.Row>
              {headers.map((header) => (
                <HeaderCell key={`header_${header.id}`} >{header.title}</HeaderCell>
              ))}
            </Table.Row>
          </TableHeader>
          {hydrated && (
            <Loader active={isLoading | isRefetching}>
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
            </Loader>
          )}
          {total !== undefined && (
            <Table.Footer celled fullWidth>
              <Table.Row>
                {!!total &&
                  <>
                    <FooterCell textAlign="right" colSpan={headers.length - 2}><strong>TOTAL</strong></FooterCell>
                    {!readOnly && !!total ? (
                      <FooterCell colSpan="1">
                      <Controller
                        name="globalDiscount"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            height="35px"
                            type="number"
                            center
                            fluid
                            value={field.value}
                            defaultValue={0}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const value = Math.max(0, Math.min(100, e.target.value));
                              setGlobalDiscount(value);
                              field.onChange(value);
                            }}
                          />
                        )}
                      />
                    </FooterCell>) : (
                      <FooterCell textAlign="center" colSpan="1">
                        {formatedPercentage(globalDiscount)}
                      </FooterCell>
                    )
                    }
                    <FooterCell colSpan="1">
                      <strong>
                        <Flex alignItems="center" justifyContent="space-between">
                          $
                          <CurrencyFormatInput
                            height="35px"
                            displayType="text"
                            thousandSeparator={true}
                            fixedDecimalScale={true}
                            decimalScale={2}
                            value={!readOnly ? total : getTotalSumWithDiscountt(total, globalDiscount)}
                          />
                        </Flex>
                      </strong>
                    </FooterCell>
                  </>
                }
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
      </Container >
    </>
  );
};

export default CustomTable;