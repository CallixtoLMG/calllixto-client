import { getEntityById } from "@/api/entity";
import PageClient from "./page.client";

const Expense = async ({ params }) => {
  const expense = await getEntityById({ id: params?.id, path: "expenses", responseEntity: "expense" });

  return <PageClient expense={expense} />;
};

export default Expense;
