import { getEntityById } from "@/api/entity";
import { ENTITIES } from "@/common/constants/entities";
import CashBalancePageClient from "./page.client";

const CashBalance = async ({ params }) => {
  const cashBalance = await getEntityById({
    id: params?.id,
    path: ENTITIES.CASH_BALANCES,
    responseEntity: ENTITIES.CASHBALANCE,
  });

  return <CashBalancePageClient cashBalance={cashBalance} />;
};

export default CashBalance;
