"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { BUDGETS_COLUMNS } from "../budgets.common";
import { Table } from '@/components/common/table';
import { ButtonContainer, } from "./styles";
import { useRouter } from "next/navigation";

const BudgetsPage = ({ budgets }) => {
  const { push } = useRouter();
  const actions = [
    {
      id: 1,
      icon: 'copy',
      color: 'green',
      onClick: (budget) => { push(PAGES.BUDGETS.CLONE(budget?.id)) },
      tooltip: 'Clonar'
    },
  ];

  return (
    <>
      <ButtonContainer>
        <GoToButton color="green" text="Crear presupuesto" iconName="add" goTo={PAGES.BUDGETS.CREATE} />
      </ButtonContainer>
      <Table headers={BUDGETS_COLUMNS} elements={budgets} page={PAGES.BUDGETS} actions={actions} />
    </>
  )
};

export default BudgetsPage;
