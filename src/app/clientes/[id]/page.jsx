import { getCustomerById } from "@/api/customers.server";
import { PAGE_CONSTANTS } from "@/common/constants/pages";
import { redirect } from "next/navigation";
import CustomerPage from "./CustomerPage";

const Customer = async ({ params }) => {
  const { customer, status } = await getCustomerById(params?.id);

  if ([401, 403].includes(status)) {
    redirect(PAGE_CONSTANTS.LOGIN.BASE);
  }

  if (!customer) {
    redirect(PAGE_CONSTANTS.NOT_FOUND.BASE);
  }

  return <CustomerPage customer={customer} />;
};

export default Customer;
