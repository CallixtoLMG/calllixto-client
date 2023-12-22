"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Button, Popup, Table } from "semantic-ui-react";
import { BUDGETS_COLUMNS } from "../budgets.common";
import { ButtonContainer, ModIcon, Cell, HeaderCell, Row } from "./styles";

const BudgetsPage = ({ budgets }) => {
  const showActions = false;
  const { push } = useRouter();
  return (
    <>
      <ButtonContainer>
        <GoToButton color="green" text="Crear presupuesto" iconName="add" goTo={PAGES.BUDGETS.CREATE} />
      </ButtonContainer>
      <Table celled compact striped>
        <Table.Header fullWidth>
          {BUDGETS_COLUMNS.map((column) => (
            <HeaderCell key={column.id}>{column.title}</HeaderCell>
          ))}
          {showActions && <HeaderCell>Acciones</HeaderCell>}
        </Table.Header>
        <Table.Body>
          {budgets?.map((budget) => (
            <Row key={budget.id}>
              {BUDGETS_COLUMNS
                .map((column) =>
                  <Cell onClick={() => { push(PAGES.BUDGETS.SHOW(budget.id)) }} key={column.id}>
                    {column.value(budget)}
                  </Cell>
                )
              }
              {showActions && (
                <Cell>
                  <Popup
                    content="Copiar"
                    size="mini"
                    trigger={<Button color="green" size='tiny' ><ModIcon name="copy" /></Button>} />
                </Cell>
              )}
            </Row>
          ))}
        </Table.Body>
      </Table>
    </>
  )
};

export default BudgetsPage;
