"use client";
import { PageHeader, Loader } from "@/components/layout";
import ShowSupplier from "@/components/suppliers/ShowSupplier";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useGetSupplier } from "@/api/suppliers";
import { useValidateToken } from "@/hooks/userData";

const Supplier = ({ params }) => {
  useValidateToken();
  const { supplier, isLoading } = useGetSupplier(params.id);
  const { push } = useRouter();

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <>
      <PageHeader title="Proveedor" />
      <Loader active={isLoading}>
        <ShowSupplier supplier={supplier} />
      </Loader>
    </>
  )
};

export default Supplier;
