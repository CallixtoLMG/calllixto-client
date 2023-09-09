"use client"
import ButtonDelete from "@/components/ButtonDelete";
import Pager from "@/components/Pager";
import SearchBar from "@/components/SearchBar";
import { Container, Table } from 'semantic-ui-react';
import { MainContainer, ModTableCell, ModTableHeaderCell, SearchBarContainer } from "./styles";

const Budget = ({ headerNames, products }) => {
  return (
    <>
      <SearchBarContainer>
        <SearchBar products={products} />
      </SearchBarContainer>
      <MainContainer>
        <Table celled compact definition>
          <Table.Header fullWidth>
            <Table.Row>
              {headerNames.map((header) => (
                <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          {products.map((product) => (
            <Table.Body key={product.id}>
              <Table.Row>
                <ModTableCell textAlign='center'>{product.id}</ModTableCell>
                <Table.Cell>{product.title}</Table.Cell>
                <Table.Cell textAlign='center'>{product.stock}</Table.Cell>
                <Table.Cell textAlign='center'>{`$${product.price}`}</Table.Cell>
                <Table.Cell textAlign='center'></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell textAlign='center'>
                  <Container fluid>
                    <ButtonDelete />
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

export default Budget;