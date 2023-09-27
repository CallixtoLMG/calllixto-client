"use client";
import ButtonDelete from "@/components/ButtonDelete";
import { PAGES } from "@/constants";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button, Table } from 'semantic-ui-react';
import { HEADERS } from "../clients.common";
import { MainContainer, ModTableCell, ModTableHeaderCell } from "./styles";

const CustomersPage = ({ customers = [] }) => {
  const router = useRouter();

  return (
    <MainContainer>
      <Link href={PAGES.CUSTOMERS.CREATE}>
        <Button color='green' content='Crear cliente' icon='add' labelPosition='right' />
      </Link>
      <Table celled striped compact>
        <Table.Header fullWidth>
          <Table.Row>
            {HEADERS.map((header) => (
              <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        {customers.map((customer) => (
          <Table.Body key={customer.email}>
            <Table.Row >
              {HEADERS
                .filter(header => !header.hide)
                .map((header) => <ModTableCell
                  onClick={() => { router.push(PAGES.CUSTOMERS.SHOW(customer.code)) }}
                  key={header.id}
                  textAlign='center'>
                  {customer[header.value]}
                </ModTableCell>)
              }
              <Table.Cell textAlign='center'>
                <Link href={PAGES.CUSTOMERS.UPDATE(customer.code)}>
                  <Button color='blue' size="tiny">Editar</Button>
                </Link>
                <ButtonDelete customer={customer} />
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        ))}
      </Table>
    </MainContainer>
  )
};

export default CustomersPage;