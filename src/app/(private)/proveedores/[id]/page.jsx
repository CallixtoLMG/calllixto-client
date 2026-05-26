import { getEntityById } from "@/api/entity";
import { ENTITIES } from "@/common/constants/entities";
import SupplierPageClient from "./page.client";

const Supplier = async ({ params }) => {
  const supplier = await getEntityById({
    id: params?.id,
    path: ENTITIES.SUPPLIERS,
    responseEntity: ENTITIES.SUPPLIER,
  });

  return <SupplierPageClient supplier={supplier} />;
};

export default Supplier;
