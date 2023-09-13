"use client"
import ButtonAddBudget from "@/components/ButtonAddBudget";
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
        <ButtonAddBudget />
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
                <Table.Cell textAlign='center'>{product.name}</Table.Cell>
                <Table.Cell textAlign='center'>{product.stock}</Table.Cell>
                <Table.Cell textAlign='center'>{`$${product.price}`}</Table.Cell>
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
};

export default Budget;