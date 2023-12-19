"use client";
import ButtonSend from "@/components/buttons/Send";
import { get } from "lodash";
import { Icon, Label, Table as STable } from "semantic-ui-react";
import { modDate, formatedPrice, getTotalSum } from "../../../utils";
import { PRODUCTS_COLUMNS } from "../budgets.common";
import {
  DataContainer,
  Button,
  Segment,
  Table,
  Cell,
  FooterCell,
  TableHeader,
  Row,
  SubContainer,
} from "./styles";
import { Flex } from "rebass";

const ShowBudget = ({ budget }) => {
  return (
    <>
      <SubContainer>
        <DataContainer>
          <Label>Cliente</Label>
          <Segment>{get(budget, "customer.name", "")}</Segment>
        </DataContainer>
        <DataContainer>
          <Label>Fecha</Label>
          <Segment>{modDate(get(budget, "createdAt", ""))}</Segment>
        </DataContainer>
      </SubContainer>
      <Flex flexDirection="column" width="100%" marginTop="10px">
        <Label align="center">Productos</Label>
        <Table celled compact>
          <STable.Header fullWidth>
            <Row>
              <TableHeader $header />
              {PRODUCTS_COLUMNS.map((column) => (
                <TableHeader $header key={column.id}>
                  {column.title}
                </TableHeader>
              ))}
            </Row>
          </STable.Header>
          {budget?.products?.map((product, index) => (
            <STable.Body key={product.code}>
              <Row>
                <Cell>{index + 1}</Cell>
                {PRODUCTS_COLUMNS.map((column) => (
                  <Cell key={column.id}>{column.value(product)}</Cell>
                ))}
              </Row>
            </STable.Body>
          ))}
          <STable.Footer celled fullWidth>
            <STable.Row>
              <FooterCell align="right" colSpan="6">
                <strong>TOTAL</strong>
              </FooterCell>
              <TableHeader colSpan="1">
                <strong>{formatedPrice(getTotalSum(budget?.products))}</strong>
              </TableHeader>
            </STable.Row>
          </STable.Footer>
        </Table>
        <Flex>
          <Button onClick={() => window.print()} color="blue">
            <Icon name="download" />Descargar PDF
          </Button>
          {(get(budget, "customer.phone") || get(budget, "customer.email")) && (
            <ButtonSend customerData={budget.customer} />
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default ShowBudget;
