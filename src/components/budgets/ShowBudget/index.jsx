"use client";
import ButtonSend from "@/components/buttons/Send";
import { get } from "lodash";
import { Icon, Label, Table } from "semantic-ui-react";
import { formatedDate, formatedPrice, getTotalSum } from "../../../utils";
import { PRODUCTS_COLUMNS } from "../budgets.common";
import {
  DataContainer,
  Button,
  Segment,
  Cell,
  FooterCell,
  HeaderCell,
  Row,
  SubContainer,
} from "./styles";
import { Flex } from "rebass";
import NoPrint from "@/components/layout/NoPrint";
import OnlyPrint from "@/components/layout/OnlyPrint";
import PDFFile from "@/components/PDFfile";

const ShowBudget = ({ budget }) => {
  return (
    <>
      <NoPrint>
        <SubContainer>
          <DataContainer>
            <Label>Cliente</Label>
            <Segment>{get(budget, "customer.name", "")}</Segment>
          </DataContainer>
          <DataContainer>
            <Label>Fecha</Label>
            <Segment>{formatedDate(get(budget, "createdAt", ""))}</Segment>
          </DataContainer>
        </SubContainer>
        <Flex flexDirection="column" width="100%" marginTop="10px">
          <Label align="center">Productos</Label>
          <Table celled compact striped>
            <Table.Header fullWidth>
              <HeaderCell $header />
              {PRODUCTS_COLUMNS.map((column) => (
                <HeaderCell $header key={column.id}>
                  {column.title}
                </HeaderCell>
              ))}
            </Table.Header>
            <Table.Body>
              {budget?.products?.map((product, index) => (
                <Row key={product.code}>
                  <Cell>{index + 1}</Cell>
                  {PRODUCTS_COLUMNS.map((column) => (
                    <Cell key={column.id}>{column.value(product)}</Cell>
                  ))}
                </Row>
              ))}
            </Table.Body>
            <Table.Footer celled fullWidth>
              <Table.Row>
                <FooterCell align="right" colSpan="6">
                  <strong>TOTAL</strong>
                </FooterCell>
                <HeaderCell colSpan="1">
                  <strong>{formatedPrice(getTotalSum(budget?.products))}</strong>
                </HeaderCell>
              </Table.Row>
            </Table.Footer>
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
      </NoPrint>
      <OnlyPrint>
        <PDFFile budget={budget} />
      </OnlyPrint>
    </>
  );
};

export default ShowBudget;
