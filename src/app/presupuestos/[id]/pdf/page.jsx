"use client"
import { useGetBudget } from "@/api/budgets";
import PDFfile from "@/components/budgets/PDFfile";
import { Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";

const PDF = ({ params }) => {
  useValidateToken();
  const { budget, isLoading } = useGetBudget(params.id);
  const { push } = useRouter();

  if (!isLoading && !budget) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <Loader active={isLoading}>
      <PDFfile budget={budget} />
    </Loader>
  )
};

export default PDF;
