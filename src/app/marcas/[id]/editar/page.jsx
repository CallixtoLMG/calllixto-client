"use client";
import { edit, useGetBrand } from "@/api/brands";
import { PageHeader, Loader } from "@/components/layout";
import BrandForm from "@/components/brands/BrandForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useRole, useValidateToken } from "@/hooks/userData";

const EditBrand = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const { brand, isLoading } = useGetBrand(params.id);

  if (!isLoading && !brand || role === "user") {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <>
      <PageHeader title="Actualizar Marca" />
      <Loader active={isLoading}>
        {brand && <BrandForm brand={brand} onSubmit={edit} />}
      </Loader>
    </>
  )
};

export default EditBrand;

