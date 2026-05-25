import { getEntityById } from "@/api/entity";
import PageClient from "./page.client";

const Supplier = async ({ params }) => {
  const supplier = await getEntityById({ id: params?.id, path: "suppliers", responseEntity: "supplier" });

  return <PageClient supplier={supplier} />;
};

export default Supplier;
