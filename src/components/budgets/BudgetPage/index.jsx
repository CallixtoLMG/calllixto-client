"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Button, Popup, Table } from 'semantic-ui-react';
import { modDate, modPrice, totalSum } from "../../../utils";
import { HEADERS } from "../budgets.common";
import { MainContainer, ModIcon, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const BudgetsPage = ({ budgets }) => {
  const router = useRouter();
  return (
    <>
      <MainContainer>
        <ButtonGoTo color="green" text="Crear presupuesto" iconName="add" goTo={PAGES.BUDGETS.CREATE} />
        <ModTable celled={true} compact >
          <Table.Header fullWidth>
            <ModTableRow>
              <ModTableHeaderCell textAlign='center'></ModTableHeaderCell>
              {HEADERS.map((header) => (
                <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
              ))}
              <ModTableHeaderCell textAlign='center'>Total</ModTableHeaderCell>
              <ModTableHeaderCell textAlign='center'>Acciones</ModTableHeaderCell>
            </ModTableRow>
          </Table.Header>
          {budgets?.map((budget, index) => (
            <Table.Body key={budget.id}>
              <ModTableRow>
                <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
                {HEADERS
                  .map((header) =>
                    <ModTableCell
                      onClick={() => { router.push(PAGES.BUDGETS.SHOW(budget.id)) }}
                      key={header.id}
                      textAlign='center'>
                      {header.value === "createdAt" ? modDate(budget[header.value]) : budget[header.value]}
                    </ModTableCell>)
                }
                <Table.Cell onClick={() => { router.push(PAGES.BUDGETS.SHOW(budget.id)) }} textAlign='center'>{modPrice(totalSum(budget.products))}</Table.Cell>
                <Table.Cell textAlign='center'><Popup content="Copiar" size="mini" trigger={<Button color="green" size='tiny' ><ModIcon name="copy" /></Button>} /> </Table.Cell>

              </ModTableRow>
            </Table.Body>
          ))}
        </ModTable>
      </MainContainer>
    </>
  )
};

export default BudgetsPage;