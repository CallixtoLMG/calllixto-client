"use client";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Button, Table } from 'semantic-ui-react';
import { HEADERS } from "../budgets.common";
import { MainContainer, ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const BudgetsPage = ({ budgets }) => {
  const router = useRouter();

  return (
    <>
      <MainContainer>
        <ModLink href={PAGES.BUDGETS.CREATE}>
          <Button color='green' content='Crear presupuesto' icon='add' labelPosition='right' />
        </ModLink>
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
                  .map((header) => <ModTableCell
                    onClick={() => { router.push(PAGES.BUDGETS.SHOW(budget.id)) }}
                    key={header.id}
                    textAlign='center'>{budget[header.value]}</ModTableCell>)
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