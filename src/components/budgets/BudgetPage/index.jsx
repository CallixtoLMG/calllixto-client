"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Button, Popup, Table } from "semantic-ui-react";
import { BUDGETS_COLUMNS } from "../budgets.common";
import { ButtonContainer, ModIcon, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const BudgetsPage = ({ budgets }) => {
  const showActions = false;
  const router = useRouter();
  return (
    <>
      <ButtonContainer>
        <ButtonGoTo color="green" text="Crear presupuesto" iconName="add" goTo={PAGES.BUDGETS.CREATE} />
      </ButtonContainer>
      <ModTable celled compact >
        <Table.Header fullWidth>
          <ModTableRow>
            {BUDGETS_COLUMNS.map((column) => (
              <ModTableHeaderCell key={column.id}>{column.name}</ModTableHeaderCell>
            ))}
            {showActions && <ModTableHeaderCell>Acciones</ModTableHeaderCell>}
          </ModTableRow>
        </Table.Header>
        <Table.Body>
          {budgets?.map((budget) => (
            <ModTableRow key={budget.id}>
              {BUDGETS_COLUMNS
                .map((column) =>
                  <ModTableCell
                    onClick={() => { router.push(PAGES.BUDGETS.SHOW(budget.id)) }}
                    key={column.id}
                  >
                    {column.value(budget)}
                  </ModTableCell>
                )
              }
              {showActions && <ModTableCell>
                <Popup
                  content="Copiar"
                  size="mini"
                  trigger={<Button color="green" size='tiny' ><ModIcon name="copy" /></Button>} />
              </ModTableCell>}
            </ModTableRow>
          ))}
        </Table.Body>
      </ModTable>
    </>
  )
};

export default BudgetsPage;
