import { Input, Price } from "@/components/common/custom";
import { Loader } from "@/components/layout";
import { formatedPercentage } from '@/utils';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Flex } from "rebass";
import { Header } from "semantic-ui-react";
import Actions from "./Actions";
import { ActionsContainer, Cell, Container, FooterCell, HeaderCell, InnerActionsContainer, LinkRow, Table, TableHeader, TableRow } from "./styles";

const CustomTable = ({
  showTotal,
  readOnly,
  isLoading,
  headers = [],
  elements = [],
  page,
  actions = [],
  total,
  mainKey = 'id',
  tableHeight,
  deleteButtonInside,
  globalDiscount,
  setGlobalDiscount,
  showPagination,
  color
}) => {
  const { push } = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      <Container tableHeight={tableHeight}>
        <Table celled compact striped color={color}>
          <TableHeader fullWidth>
            <Table.Row>
              {headers.map((header) => (
                <HeaderCell key={`header_${header.id}`} >{header.title}</HeaderCell>
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
          {showTotal && (
            <Table.Footer celled fullWidth>
              <Table.Row>
                <>
                  <FooterCell textAlign="right" colSpan={3}></FooterCell>
                  <FooterCell textAlign="center" colSpan={headers.length - 5}><strong>TOTAL</strong></FooterCell>
                  {!readOnly ? (
                    <FooterCell colSpan="1">
                      <Flex alignItems="center" style={{ gridColumnGap: '5px' }}>
                        <Input
                          marginBottom
                          center
                          height="35px"
                          type="number"
                          value={globalDiscount}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value > 100) return;
                            if (value < 0) return;
                            setGlobalDiscount(value);
                          }}
                        />
                        %
                      </Flex>
                    </FooterCell>) : (
                    <FooterCell textAlign="center" colSpan="1">
                      {formatedPercentage(globalDiscount)}
                    </FooterCell>
                  )
                  }
                  <FooterCell colSpan="1">
                    <strong>
                      <Price value={total} />
                    </strong>
                  </FooterCell>
                </>
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
      </Container>
    </>
  );
};

export default CustomTable;