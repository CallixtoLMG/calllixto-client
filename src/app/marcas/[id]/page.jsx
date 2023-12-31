"use client";
import { edit, useGetBrand } from "@/api/brands";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";
import BrandForm from "@/components/brands/BrandForm";
import { useAllowUpdate } from "@/hooks/allowUpdate";

const Brand = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { brand, isLoading } = useGetBrand(params.id);
  const [allowUpdate, Toggle] = useAllowUpdate();

  if (!isLoading && !brand) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <>
      <PageHeader title="Marca" />
      <Loader active={isLoading}>
        {Toggle}
        <BrandForm brand={brand} onSubmit={edit} readonly={!allowUpdate} />
      </Loader>
    </>
  )
};

export default Brand;
