"use client";
import ButtonGoto from "@/components/buttons/GoTo";
// import ButtonSend from "@/components/buttons/Send";
import { PAGES } from "@/constants";
import { Grid, Label, Table } from 'semantic-ui-react';
import { modDate, modPrice, totalSum } from '../../../utils';
import { PRODUCTSHEADERS } from "../budgets.common";
import { DataContainer, MainContainer, ModLabel, ModSegment, ModTable, ModTableHeaderCell, ModTableRow, SubContainer } from "./styles";

const ShowBudget = ({ budget }) => {
  return (
    <MainContainer>
      <SubContainer>
        <DataContainer>
          <ModLabel>Cliente</ModLabel>
          {/* <ModSegment>{budget.customer.name}</ModSegment> */}
          <ModSegment>Milton</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel> Fecha </ModLabel>
          <ModSegment>{modDate(budget.createdAt)}</ModSegment>
        </DataContainer>
      </SubContainer>
      <Grid >
        <Grid.Row stretched>
          <Grid.Column textAlign='center' >
            <Label> Productos </Label>
            <ModTable celled compact>
              <Table.Header fullWidth>
                <ModTableRow>
                  <ModTableHeaderCell ></ModTableHeaderCell>
                  {PRODUCTSHEADERS.map((header) => (
                    <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
                  ))}
                </ModTableRow>
              </Table.Header>
              {budget.products.map((product, index) => (
                <Table.Body key={product.code}>
                  <ModTableRow >
                    <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
                    {PRODUCTSHEADERS
                      .filter(header => !header.hide)
                      .map((header) => <Table.Cell
                        key={header.id}
                        textAlign='center'>
                        {header.modPrice ? modPrice(product[header.value]) : product[header.value]}
                      </Table.Cell>)
                    }
                  </ModTableRow>
                </Table.Body>
              ))}
              <Table.Footer celled fullWidth>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell textAlign="center" colSpan='1'><strong>Suma Total</strong></Table.HeaderCell>
                  <Table.HeaderCell colSpan='3' />
                  <Table.HeaderCell textAlign="center" colSpan='1'><strong>{modPrice(totalSum(budget.products))}</strong></Table.HeaderCell>
                </Table.Row>
              </Table.Footer>
            </ModTable>
          </Grid.Column>
        </Grid.Row>
        <ButtonGoto goTo={PAGES.BUDGETS.SHOWPDF(budget.id)} iconName="eye" text="Ver PDF" color="blue" />
        {/* {budget.customer.phone && budget.customer.email && (
          <ButtonSend customerData={budget.customer} />
        )} */}
      </Grid>
    </MainContainer>
  )
};

export default ShowBudget;