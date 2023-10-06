"use client";
import { Grid, Label, Table } from 'semantic-ui-react';
import { modDate, totalSum } from '../../../utils';
import { PRODUCTSHEADERS } from "../budgets.common";
import { MainContainer, ModLabel, ModSegment, ModTable, ModTableHeaderCell, ModTableRow } from "./styles";

const ShowBudget = ({ budget }) => {

  return (
    <MainContainer>
      <Grid divided>
        <Grid.Row stretched>
          <Grid.Column >
            <ModLabel>Cliente</ModLabel>
            <ModSegment>{budget.customerId}</ModSegment>
            <ModLabel> Fecha </ModLabel>
            <ModSegment>{modDate(budget.createdAt)}</ModSegment>
            <Label> Productos </Label>
            <ModTable celled compact>
              <Table.Header fullWidth>
                <ModTableRow>
                  <ModTableHeaderCell textAlign='center'></ModTableHeaderCell>
                  {PRODUCTSHEADERS.map((header) => (
                    <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
                  ))}
                </ModTableRow>
              </Table.Header>
              {budget.products.map((product, index) => (
                <Table.Body key={product.id}>
                  <ModTableRow >
                    <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
                    {PRODUCTSHEADERS
                      .filter(header => !header.hide)
                      .map((header) => <Table.Cell
                        key={header.id}
                        textAlign='center'>
                        {product[header.value]}
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
                  <Table.HeaderCell textAlign="center" colSpan='1'><strong>{totalSum(budget.products)}</strong></Table.HeaderCell>
                </Table.Row>
              </Table.Footer>
            </ModTable>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </MainContainer>
  )
};

export default ShowBudget;