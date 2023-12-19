"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Button, Popup, Table } from "semantic-ui-react";
import { modDate, formatedPrice, totalSum } from "../../../utils";
import { HEADERS } from "../budgets.common";
import { ButtonContainer, HeaderContainer, ModIcon, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const BudgetsPage = ({ budgets, isLoading }) => {
  const showActions = false;
  const router = useRouter();
  return (
    <>
      <HeaderContainer>
        <PageHeader title={"Presupuestos"} />
      </HeaderContainer>
      <Loader active={isLoading}>
        <ButtonContainer>
          <ButtonGoTo color="green" text="Crear presupuesto" iconName="add" goTo={PAGES.BUDGETS.CREATE} />
        </ButtonContainer>
        <ModTable celled compact >
          <Table.Header fullWidth>
            <ModTableRow>
              {HEADERS.map((header) => (
                <ModTableHeaderCell key={header.id} >{header.name}</ModTableHeaderCell>
              ))}
              <ModTableHeaderCell>Total</ModTableHeaderCell>
              {showActions && <ModTableHeaderCell>Acciones</ModTableHeaderCell>}
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
                <ModTableCell onClick={() => { router.push(PAGES.BUDGETS.SHOW(budget.id)) }}>{formatedPrice(totalSum(budget.products))}</ModTableCell>
                {showActions && <ModTableCell>
                  <Popup
                    content="Copiar"
                    size="mini"
                    trigger={<Button color="green" size='tiny' ><ModIcon name="copy" /></Button>} />
                </ModTableCell>}
              </ModTableRow>
            </Table.Body>
          ))}
        </ModTable>
      </Loader>
    </>
  )
};

export default BudgetsPage;
