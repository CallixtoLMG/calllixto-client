"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { BUDGETS_COLUMNS, FILTERS } from "../budgets.common";
import { Table } from '@/components/common/table';
import { useRouter } from "next/navigation";
import { ButtonsContainer } from "@/components/common/custom";

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
      <ButtonsContainer>
        <GoToButton color="green" text="Crear presupuesto" iconName="add" goTo={PAGES.BUDGETS.CREATE} />
      </ButtonsContainer>
      <Table
        headers={BUDGETS_COLUMNS}
        elements={budgets}
        page={PAGES.BUDGETS}
        actions={actions}
        filters={FILTERS}
      />
    </>
  )
};

export default BudgetsPage;
