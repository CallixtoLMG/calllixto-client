import { getEntityById } from "@/api/entity";
import { ENTITIES } from "@/common/constants/entities";
import CustomerPageClient from "./page.client";

const Customer = async ({ params }) => {
  const customer = await getEntityById({
    id: params?.id,
    path: ENTITIES.CUSTOMERS,
    responseEntity: ENTITIES.CUSTOMER,
  });

  return <CustomerPageClient customer={customer} customerId={params.id} />;
};

export default Customer;
