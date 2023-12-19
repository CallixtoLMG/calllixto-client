"use client";
import ButtonDelete from "@/components/buttons/Delete";
import ButtonEdit from "@/components/buttons/Edit";
import ButtonGoTo from "@/components/buttons/GoTo";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Table } from "semantic-ui-react";
import { HEADERS } from "../clients.common";
import { ButtonContainer, Cell, HeaderCell } from "./styles";

const CustomersPage = ({ customers = [], onDelete }) => {
  const { push } = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el cliente "${name}"?`;

  return (
    <>
      <ButtonContainer>
        <ButtonGoTo
          color="green"
          text="Crear cliente"
          iconName="add"
          goTo={PAGES.CUSTOMERS.CREATE} />
      </ButtonContainer>
      <Table celled compact striped>
        <Table.Header fullWidth>
          <HeaderCell />
          {HEADERS.map((header) => (
            <HeaderCell key={header.id} >{header.name}</HeaderCell>
          ))}
        </Table.Header>
        <Table.Body>
          {customers.map((customer, index) => (
            <Table.Row key={customer.name}>
              <Cell>{index + 1}</Cell>
              {HEADERS
                .filter(header => !header.hide)
                .map((header) => (
                  <Cell
                    onClick={() => { push(PAGES.CUSTOMERS.SHOW(customer.id)) }}
                    key={header.id}
                  >
                    {customer[header.value]}
                  </Cell>
                ))
              }
              <Cell>
                <ButtonEdit page={"CUSTOMERS"} element={customer.id} />
                <ButtonDelete
                  onDelete={onDelete}
                  params={customer.id}
                  deleteQuestion={deleteQuestion(customer.name)} />
              </Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
};

export default CustomersPage;
