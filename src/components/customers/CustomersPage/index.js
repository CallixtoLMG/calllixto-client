"use client";
import ButtonDelete from "@/components/ButtonDelete";
import ButtonEdit from "@/components/ButtonEdit";
import { PAGES } from "@/constants";
import { useRouter } from 'next/navigation';
import { Button, Table } from 'semantic-ui-react';
import { HEADERS } from "../clients.common";
import { MainContainer, ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow, } from "./styles";

const CustomersPage = ({ customers = [] }) => {
  const router = useRouter();

  return (
    <MainContainer>
      <ModLink href={PAGES.CUSTOMERS.CREATE}>
        <Button color='green' content='Crear cliente' icon='add' labelPosition='right' />
      </ModLink>
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
                <ButtonDelete customer={customer} />
              </Table.Cell>
            </ModTableRow>
          </Table.Body>
        ))}
      </ModTable>
    </MainContainer>
  )
};

export default CustomersPage;