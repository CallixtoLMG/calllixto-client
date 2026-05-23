import { getBrandById } from "@/api/brands.server";
import { PAGE_CONSTANTS } from "@/common/constants/pages";
import { redirect } from "next/navigation";
import BrandPage from "./BrandPage";

const Brand = async ({ params }) => {
  const { brand, status } = await getBrandById(params?.id);

  if ([401, 403].includes(status)) {
    redirect(PAGE_CONSTANTS.LOGIN.BASE);
  }

  if (!brand) {
    redirect(PAGE_CONSTANTS.NOT_FOUND.BASE);
  }

  return <BrandPage brand={brand} />;
};

export default Brand;
