import { getEntityById } from "@/api/entity";
import PageClient from "./page.client";

const Customer = async ({ params }) => {
  const customer = await getEntityById({ id: params?.id, path: "customers", responseEntity: "customer" });

  return <PageClient customer={customer} />;
};

export default Customer;
