"use client";
import { deleteCustomer } from "@/api/customers";
import ButtonDelete from "@/components/buttons/Delete";
import ButtonEdit from "@/components/buttons/Edit";
import ButtonGoTo from "@/components/buttons/GoTo";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from 'next/navigation';
import { Table } from 'semantic-ui-react';
import { HEADERS } from "../clients.common";
import { MainContainer, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow, SubContainer } from "./styles";

const CustomersPage = ({ customers = [] }) => {
  const router = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el cliente "${name}"?`;

  return (
    <MainContainer>
      <SubContainer>
        <PageHeader title="Clientes" />
        <ButtonGoTo color="green" text="Crear cliente" iconName="add" goTo={PAGES.CUSTOMERS.CREATE} />
        {!!customers.length &&
          <ModTable celled compact>
            <Table.Header fullWidth>
              <ModTableRow>
                <ModTableHeaderCell textAlign='center'></ModTableHeaderCell>
                {HEADERS.map((header) => (
                  <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
                ))}
              </ModTableRow>
            </Table.Header>
            {customers.map((customer, index) => (
              <Table.Body key={customer.name}>
                <ModTableRow >
                  <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
                  {HEADERS
                    .filter(header => !header.hide)
                    .map((header) => <ModTableCell
                      onClick={() => { router.push(PAGES.CUSTOMERS.SHOW(customer.id)) }}
                      key={header.id}
                      textAlign='center'>
                      {customer[header.value]}
                    </ModTableCell>)
                  }
                  <Table.Cell textAlign='center'>
                    <ButtonEdit page={"CUSTOMERS"} element={customer.id} />
                    <ButtonDelete onDelete={deleteCustomer} params={customer.id} deleteQuestion={deleteQuestion(customer.name)} />
                  </Table.Cell>
                </ModTableRow>
              </Table.Body>
            ))}
          </ModTable>
        }
      </SubContainer>
    </MainContainer>
  )
};

export default CustomersPage;