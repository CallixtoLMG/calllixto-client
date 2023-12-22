"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { BUDGETS_COLUMNS } from "../budgets.common";
import { Table } from '@/components/common/table';
import { ButtonContainer, } from "./styles";

const BudgetsPage = ({ budgets }) => {
  return (
    <>
      <ButtonContainer>
        <GoToButton color="green" text="Crear presupuesto" iconName="add" goTo={PAGES.BUDGETS.CREATE} />
      </ButtonContainer>
      <Table headers={BUDGETS_COLUMNS} elements={budgets} page={PAGES.BUDGETS}/>
    </>
  )
};

export default BudgetsPage;
