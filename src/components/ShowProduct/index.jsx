"use client"
import ButtonBack from "@/components/ButtonBack";
import { Container, Table } from 'semantic-ui-react';
import { MainContainer, ModTableCell, ModTableHeaderCell } from "./styles";

const ShowProduct = ({ headerNames, product }) => {
  return (
    <>
      <MainContainer>
        <Container>
          <ButtonBack />
        </Container>
        <Table celled compact definition>
          <Table.Header fullWidth>
            <Table.Row>
              {headerNames.map((header) => (
                <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <ModTableCell textAlign='center'>{product.id}</ModTableCell>
              <Table.Cell textAlign='center'>{product.name}</Table.Cell>
              <Table.Cell textAlign='center'>{product.stock}</Table.Cell>
              <Table.Cell textAlign='center'>{product.price}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </MainContainer>
    </>
  )
};

export default ShowProduct;