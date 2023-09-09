"use client"
import ButtonCreateBudget from "@/components/ButtonCreateBudget";
import ButtonDelete from "@/components/ButtonDelete";
import Pager from "@/components/Pager";
import PopUpEdit from "@/components/PopUpEdit";
import { Button, Container, Table } from 'semantic-ui-react';
import { MainContainer, ModLink, ModTableCell, ModTableHeaderCell } from "./styles";

const TableOfProducts = ({ headerNames, products }) => {
  return (
    <>
      <MainContainer>
      <ButtonCreateBudget />
        <Table celled compact definition>
          <Table.Header fullWidth>
            <Table.Row>
              {headerNames.map((header) => (
                <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          {products.map((product) => (
            <Table.Body key={products.id}>
              <Table.Row>
               <ModTableCell textAlign='center'>{product.id}</ModTableCell>
                <Table.Cell >{product.title}</Table.Cell>
                <Table.Cell textAlign='center'>{product.stock}</Table.Cell>
                <Table.Cell>{product.category}</Table.Cell>
                <Table.Cell textAlign='center'>
                  <Container fluid>
                    <PopUpEdit />
                    <ButtonDelete />
                    <ModLink href={`/productos/${product.id}`}><Button size="tiny">Ir al producto</Button></ModLink>
                  </Container>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          ))}
        </Table>
      </MainContainer>
      <Container textAlign="center">
        <Pager />
      </Container>
    </>
  )
}

export default TableOfProducts;