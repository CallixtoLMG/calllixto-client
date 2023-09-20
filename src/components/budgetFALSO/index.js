"use client"
import { Container, Table } from 'semantic-ui-react';
import { MainContainer, ModTableCell, ModTableHeaderCell } from "./styles";

const Budget = ({ headerNames, products }) => {

  // const budgets = [{
  //   id: 1,
  //   name: "Revendedores 200",
  //   date: "15/09/2029",
  //   totalValue: "3.487,60",
  //   products: []
  // },
  // {
  //   id: 2,
  //   name: "Batistella",
  //   date: "08/01/2023",
  //   totalValue: "80.000",
  //   products: []
  // },{
  //   id: 3,
  //   name: "Batistella",
  //   date: "02/05/2019",
  //   totalValue: "30.000",
  //   products: []
  // }]

  return (
    <>
      <MainContainer>
        <Table striped celled compact definition>
          <Table.Header fullWidth>
            <Table.Row>
              {headerNames.map((header) => (
                <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          {products?.map((product) => (
            <Table.Body key={product.id}>
              <Table.Row>
                <ModTableCell textAlign='center'>{product.id}</ModTableCell>
                <Table.Cell textAlign='center'>{product.clientName}</Table.Cell>
                <Table.Cell textAlign='center'>{product.date}</Table.Cell>
                <Table.Cell textAlign='center'>{`$${product.totalValue}`}</Table.Cell>
              </Table.Row>
            </Table.Body>
          ))}
        </Table>
      </MainContainer>
      <Container textAlign="center">
      </Container>
    </>
  )
};

export default Budget;