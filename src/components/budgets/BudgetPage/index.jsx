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
      <MainContainer>
        <SearchBarContainer>
          <Link href={PAGES.BUDGETS.CREATE}>
            <Button color='green' content='Crear presupuesto' icon='add' labelPosition='right' />
          </Link>
          <SearchBar budgets={budgets} />
        </SearchBarContainer>
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