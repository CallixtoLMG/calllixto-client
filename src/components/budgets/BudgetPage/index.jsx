"use client";
import SearchBar from "@/components/SearchBar";
import { Button, Table } from 'semantic-ui-react';
import { MainContainer, ModTableHeaderCell, SearchBarContainer } from "./styles";
import { PAGES } from "@/constants";
import { HEADERS } from "../budgets.common";
import Link from "next/link";

const BudgetsPage = ({ budgets }) => {
  return (
    <>
      <SearchBarContainer>
        <SearchBar budgets={budgets} />
        <Link href={PAGES.BUDGETS.CREATE}>
          <Button color='green' content='Crear presupuesto' icon='add' labelPosition='right' />
        </Link>
      </SearchBarContainer>
      <MainContainer>
        <Table striped celled compact definition>
          <Table.Header fullWidth>
            <Table.Row>
              {HEADERS.map((header) => (
                <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          {budgets?.map((budget) => (
            <Table.Body key={budget.id}>
              <Table.Row>
                {HEADERS
                  .map((header) => <Table.Cell textAlign='center'>{budget[header.value]}</Table.Cell>)
                }
              </Table.Row>
            </Table.Body>
          ))}
        </Table>
      </MainContainer>
    </>
  )
};

export default BudgetsPage;