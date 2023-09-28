"use client";
import ButtonDelete from "@/components/ButtonDelete";
import { PAGES } from "@/constants";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button, Table } from 'semantic-ui-react';
import { HEADERS } from "../clients.common";
import { MainContainer, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const CustomersPage = ({ customers = [] }) => {
  const router = useRouter();

  return (
    <MainContainer>
      <Link href={PAGES.CUSTOMERS.CREATE}>
        <Button color='green' content='Crear cliente' icon='add' labelPosition='right' />
      </Link>
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
                <Link href={PAGES.CUSTOMERS.UPDATE(customer.id)}>
                  <Button color='blue' size="tiny">Editar</Button>
                </Link>
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