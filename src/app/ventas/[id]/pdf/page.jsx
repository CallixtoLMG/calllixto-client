"use client";
import { useGetBudget } from "@/api/budgets";
import PDFfile from "@/components/budgets/PDFfile";
import { Loader } from "@/components/layout";
import { PAGES } from "@/common/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks";
import { useUserContext } from "@/User";
import { getFormatedPhone } from "@/common/utils";
import { BUDGET_PDF_FORMAT } from "@/components/budgets/budgets.constants";
import { getTotalSum } from "@/components/budgets/budgets.utils";

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
      <PDFfile
        budget={budget}
        client={userData?.client}
        subtotal={getTotalSum(budget?.products)}
        printPdfMode={BUDGET_PDF_FORMAT.CLIENT.key}
        selectedContact={{
          address: budget?.customer?.addresses?.[0]?.address,
          phone: getFormatedPhone(budget?.customer?.phoneNumbers?.[0]),
        }}
      />
    </Loader>
  )
};

export default PDF;
