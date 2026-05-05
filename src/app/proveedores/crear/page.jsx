"use client";
import { useCreateSupplier } from "@/api/suppliers";
import { PAGES } from "@/common/constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CreateSupplier = () => {
  const { push } = useRouter();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const createSupplier = useCreateSupplier();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.SUPPLIERS.NAME }, { name: 'Crear' }]);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: createSupplier,
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.SUPPLIERS.SHOW(response.supplier.id))
        toast.success('Proveedor creado!');
      } else {
        toast.error(`${response.message} (${response.error.message})`);
      }
    },
  });

  return (
    <SupplierForm onSubmit={mutate} isLoading={isPending} />
  )
};

export default CreateSupplier;
