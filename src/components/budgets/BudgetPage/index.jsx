"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Button, Popup, Table } from "semantic-ui-react";
import { modDate, modPrice, totalSum } from "../../../utils";
import { HEADERS } from "../budgets.common";
import {
  MainContainer,
  ModIcon,
  ModTable,
  ModTableCell,
  ModTableHeaderCell,
  ModTableRow,
  SubContainer,
} from "./styles";
import Loader from "@/components/layout/Loader";

const BudgetsPage = ({ budgets, isLoading }) => {
  const router = useRouter();
  return (
    <MainContainer>
      <SubContainer>
        <PageHeader title={"Presupuestos"} />
        <ButtonGoTo
          color="green"
          text="Crear presupuesto"
          iconName="add"
          goTo={PAGES.BUDGETS.CREATE}
        />
        <Loader active={isLoading}>
          <ModTable celled compact>
            <Table.Header fullWidth>
              <ModTableRow>
                <ModTableHeaderCell textAlign="center"></ModTableHeaderCell>
                {HEADERS.map((header) => (
                  <ModTableHeaderCell key={header.id} textAlign="center">
                    {header.name}
                  </ModTableHeaderCell>
                ))}
                <ModTableHeaderCell textAlign="center">
                  Total
                </ModTableHeaderCell>
                <ModTableHeaderCell textAlign="center">
                  Acciones
                </ModTableHeaderCell>
              </ModTableRow>
            </Table.Header>
            {budgets?.map((budget, index) => (
              <Table.Body key={budget.id}>
                <ModTableRow>
                  <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                  {HEADERS
                    .map((header) => (
                      <ModTableCell
                        onClick={() => {
                          router.push(PAGES.BUDGETS.SHOW(budget.id));
                        }}
                        key={header.id}
                        textAlign="center"
                      >
                        {header.date
                          ? modDate(budget[header.value])
                          : budget[header.object]
                          ? budget[header.object][header.value]
                          : budget[header.value]}
                      </ModTableCell>
                    ))}
                  <Table.Cell
                    onClick={() => {
                      router.push(PAGES.BUDGETS.SHOW(budget.id));
                    }}
                    textAlign="center"
                  >
                    {modPrice(totalSum(budget.products))}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <Popup
                      content="Copiar"
                      size="mini"
                      trigger={
                        <Button color="green" size="tiny">
                          <ModIcon name="copy" />
                        </Button>
                      }
                    />
                  </Table.Cell>
                </ModTableRow>
              </Table.Body>
            ))}
          </ModTable>
        </Loader>
      </SubContainer>
    </MainContainer>
  );
};

export default BudgetsPage;
