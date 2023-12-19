"use client";
// import { deleteCustomer } from "@/api/customers";
import ButtonDelete from "@/components/buttons/Delete";
import ButtonEdit from "@/components/buttons/Edit";
import ButtonGoTo from "@/components/buttons/GoTo";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Table as STable } from "semantic-ui-react";
import { HEADERS } from "../clients.common";
import { ButtonContainer, HeaderContainer, Table, Cell, TableHeader, Row } from "./styles";

const CustomersPage = ({ customers = [], isLoading, onDelete }) => {
  const router = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el cliente "${name}"?`;

  return (
    <>
      <HeaderContainer>
        <PageHeader title={"Clientes"} />
      </HeaderContainer>
      <Loader active={isLoading}>
        <ButtonContainer>
          <ButtonGoTo
            color="green"
            text="Crear cliente"
            iconName="add"
            goTo={PAGES.CUSTOMERS.CREATE} />
        </ButtonContainer>
        {customers.length &&
          <Table celled compact>
            <STable.Header fullWidth>
              <TableHeader />
              {HEADERS.map((header) => (
                <TableHeader key={header.id} >{header.name}</TableHeader>
              ))}
            </STable.Header>
            {customers.map((customer, index) => (
              <STable.Body key={customer.name}>
                <Row >
                  <Cell>{index + 1}</Cell>
                  {HEADERS
                    .filter(header => !header.hide)
                    .map((header) => (
                      <Cell
                        onClick={() => { router.push(PAGES.CUSTOMERS.SHOW(customer.id)) }}
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
                </Row>
              </STable.Body>
            ))}
          </Table>
        }
      </Loader>
    </>
  );
};

export default CustomersPage;
