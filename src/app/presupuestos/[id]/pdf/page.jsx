"use client";
import { useGetBudget } from "@/api/budgets";
import PDFfile from "@/components/budgets/PDFfile";
import { Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";
import { useUserContext } from "@/User";

const PDF = ({ params }) => {
  useValidateToken();
  const { data: budget, isLoading } = useGetBudget(params.id);
  const { userData } = useUserContext();
  const { push } = useRouter();

  if (!isLoading && !budget) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <Loader active={isLoading}>
      <PDFfile budget={budget} client={userData?.client?.metadata} />
    </Loader>
  )
};

export default PDF;
