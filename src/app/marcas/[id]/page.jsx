import { getEntityById } from "@/api/entity";
import PageClient from "./page.client";

const Brand = async ({ params }) => {
  const brand = await getEntityById({ id: params?.id, path: "brands", responseEntity: "brand" });

  return <PageClient brand={brand} />;
};

export default Brand;
