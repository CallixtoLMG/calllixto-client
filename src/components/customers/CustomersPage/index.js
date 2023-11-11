"use client";
import { deleteCustomer } from "@/app/clientes/page";
import ButtonDelete from "@/components/buttons/Delete";
import ButtonEdit from "@/components/buttons/Edit";
import ButtonGoTo from "@/components/buttons/GoTo";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from 'next/navigation';
import { Table } from 'semantic-ui-react';
import { HEADERS } from "../clients.common";
import { MainContainer, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const CustomersPage = ({ customers = [] }) => {
  console.log(customers)
  const router = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el cliente "${name}"?`

  return (
    <MainContainer>
      <PageHeader title="Clientes"/>
      <ButtonGoTo color="green" text="Crear cliente" iconName="add" goTo={PAGES.CUSTOMERS.CREATE} />
      {!!customers.length &&
        <ModTable celled={true} compact>
          <Table.Header fullWidth>
            <ModTableRow>
              <ModTableHeaderCell textAlign='center'></ModTableHeaderCell>
              {HEADERS.map((header) => (
                <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
              ))}
            </ModTableRow>
          </Table.Header>
          {customers.map((customer, index) => (
            <Table.Body key={customer.email}>
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
    </MainContainer>
  )
};

export default CustomersPage;