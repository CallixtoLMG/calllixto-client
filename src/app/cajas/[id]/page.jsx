import { getEntityById } from "@/api/entity";
import PageClient from "./page.client";

const CashBalance = async ({ params }) => {
  const cashBalance = await getEntityById({ id: params?.id, path: "cash-balances", responseEntity: "cashBalance" });

  return <PageClient cashBalance={cashBalance} />;
};

export default CashBalance;
