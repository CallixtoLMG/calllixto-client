"use client";
import SearchBar from "@/components/SearchBar";
import { PAGES } from "@/constants";
import Link from "next/link";
import { Button, Table } from 'semantic-ui-react';
import { HEADERS } from "../budgets.common";
import { MainContainer, ModTable, ModTableHeaderCell, ModTableRow, SearchBarContainer } from "./styles";

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
        <ModTable celled compact >
          <Table.Header fullWidth>
            <ModTableRow>
              <ModTableHeaderCell textAlign='center'></ModTableHeaderCell>
              {HEADERS.map((header) => (
                <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
              ))}
            </ModTableRow>
          </Table.Header>
          {budgets?.map((budget, index) => (
            <Table.Body key={budget.id}>
              <ModTableRow>
                <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
                {HEADERS
                  .map((header) => <Table.Cell key={header.id} textAlign='center'>{budget[header.value]}</Table.Cell>)
                }
              </ModTableRow>
            </Table.Body>
          ))}
        </ModTable>
      </MainContainer>
    </>
  )
};

export default BudgetsPage;