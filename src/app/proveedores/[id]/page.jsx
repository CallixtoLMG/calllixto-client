import { getSupplierById } from "@/api/suppliers.server";
import { PAGE_CONSTANTS } from "@/common/constants/pages";
import { redirect } from "next/navigation";
import SupplierPage from "./SupplierPage";

const Supplier = async ({ params }) => {
  const { supplier, status } = await getSupplierById(params?.id);

  if ([401, 403].includes(status)) {
    redirect(PAGE_CONSTANTS.LOGIN.BASE);
  }

  if (!supplier) {
    redirect(PAGE_CONSTANTS.NOT_FOUND.BASE);
  }

  return <SupplierPage supplier={supplier} />;
};

export default Supplier;
