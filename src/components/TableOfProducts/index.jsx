"use client"
import ButtonDelete from "@/components/ButtonDelete";
import CreateBudget from "@/components/CreateBudget";
import Pager from "@/components/Pager";
import PopUpEdit from "@/components/PopUpEdit";
import { Container, Table } from 'semantic-ui-react';
import { MainContainer, ModTableCell, ModTableHeaderCell } from "./styles";

const TableOfProducts = ({ headerNames, users }) => {
  return (
    <>
      <Container>
        
      </Container>
      <MainContainer>
      <CreateBudget />
        <Table celled compact definition>
          <Table.Header fullWidth>
            <Table.Row>
              {headerNames.map((header) => (
                <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          {users.map((user) => (
            <Table.Body key={user.id}>
              <Table.Row>
                <ModTableCell textAlign='center'>{user.id}</ModTableCell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>{user.phone}</Table.Cell>
                <Table.Cell textAlign='center'>
                  <Container fluid>
                    <PopUpEdit />
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

export default TableOfProducts;