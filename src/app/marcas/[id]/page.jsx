"use client";
import { useGetBrand } from "@/api/brands";
import { PageHeader, Loader } from "@/components/layout";
import ShowBrand from "@/components/brands/ShowBrand";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";

const Brand = ({ params }) => {
  useValidateToken();
  const { brand, isLoading } = useGetBrand(params.id);
  const { push } = useRouter();

  if (!isLoading && !brand) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <>
      <PageHeader title="Marca" />
      <Loader active={isLoading}>
        <ShowBrand brand={brand} />
      </Loader>
    </>
  )
};

export default Brand;
