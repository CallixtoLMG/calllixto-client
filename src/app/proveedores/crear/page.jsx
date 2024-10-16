"use client";
import { useCreateSupplier } from "@/api/suppliers";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CreateSupplier = () => {
  useValidateToken();
  const { push } = useRouter();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const createSupplier = useCreateSupplier();
  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.SUPPLIERS.NAME, 'Crear']);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (supplier) => {
      const response = await createSupplier(supplier);
      return response;
    },
    onSuccess: async (response) => {
      if (response.statusOk) {
        toast.success('Proveedor creado!');
        push(PAGES.SUPPLIERS.BASE);
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <SupplierForm onSubmit={mutate} isLoading={isPending} />
  )
};

export default CreateSupplier;
