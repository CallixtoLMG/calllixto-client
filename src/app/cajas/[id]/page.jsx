import { getCashBalanceById } from "@/api/cashBalances.server";
import { PAGE_CONSTANTS } from "@/common/constants/pages";
import { redirect } from "next/navigation";
import CashBalancePage from "./CashBalancePage";

const CashBalance = async ({ params }) => {
  const { cashBalance, status } = await getCashBalanceById(params?.id);

  if ([401, 403].includes(status)) {
    redirect(PAGE_CONSTANTS.LOGIN.BASE);
  }

  if (!cashBalance) {
    redirect(PAGE_CONSTANTS.NOT_FOUND.BASE);
  }

  return <CashBalancePage cashBalance={cashBalance} />;
};

export default CashBalance;
