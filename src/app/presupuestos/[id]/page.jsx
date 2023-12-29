"use client";
import { useGetBudget } from "@/api/budgets";
import ShowBudget from "@/components/budgets/ShowBudget";
import { PageHeader, Loader, NoPrint } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";

const Budget = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { budget, isLoading } = useGetBudget(params.id);

  if (!isLoading && !budget) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <>
      <NoPrint>
        <PageHeader title="Presupuesto" />
      </NoPrint>
      <Loader active={isLoading}>
        <ShowBudget budget={budget} />
      </Loader>
    </>
  )
};

export default Budget;
