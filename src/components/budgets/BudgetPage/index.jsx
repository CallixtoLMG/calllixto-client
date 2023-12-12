"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Button, Popup, Table } from 'semantic-ui-react';
import { modDate, modPrice, totalSum } from "../../../utils";
import { HEADERS } from "../budgets.common";
import { ModIcon, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const BudgetsPage = ({ budgets }) => {
  const router = useRouter();
  return (
    <>
      <PageHeader title={"Presupuestos"} />
      <ButtonGoTo color="green" text="Crear presupuesto" iconName="add" goTo={PAGES.BUDGETS.CREATE} />
      <ModTable celled compact >
        <Table.Header fullWidth>
          <ModTableRow>
            {HEADERS.map((header) => (
              <ModTableHeaderCell key={header.id} >{header.name}</ModTableHeaderCell>
            ))}
            <ModTableHeaderCell>Total</ModTableHeaderCell>
            <ModTableHeaderCell>Acciones</ModTableHeaderCell>
          </ModTableRow>
        </Table.Header>
        {budgets?.map((budget, index) => (
          <Table.Body key={budget.id}>
            <ModTableRow>
              {HEADERS
                .map((header) =>
                  <ModTableCell
                    onClick={() => { router.push(PAGES.BUDGETS.SHOW(budget.id)) }}
                    key={header.id}
                  >
                    {header.date ? modDate(budget[header.value]) : budget[header.object] ? budget[header.object][header.value] : budget[header.value]}
                  </ModTableCell>)
              }
              <ModTableCell onClick={() => { router.push(PAGES.BUDGETS.SHOW(budget.id)) }}>{modPrice(totalSum(budget.products))}</ModTableCell>
              <ModTableCell><Popup content="Copiar" size="mini" trigger={<Button color="green" size='tiny' ><ModIcon name="copy" /></Button>} /> </ModTableCell>
            </ModTableRow>
          </Table.Body>
        ))}
      </ModTable>
    </>
  )
};

export default BudgetsPage;