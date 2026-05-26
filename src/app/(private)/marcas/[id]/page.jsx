import { getEntityById } from "@/api/entity";
import { ENTITIES } from "@/common/constants/entities";
import BrandPageClient from "./page.client";

const Brand = async ({ params }) => {
  const brand = await getEntityById({
    id: params?.id,
    path: ENTITIES.BRANDS,
    responseEntity: ENTITIES.BRAND,
  });

  return <BrandPageClient brand={brand} />;
};

export default Brand;
