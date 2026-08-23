"use client";
import { useCreateSupplier } from "@/api/suppliers";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { PAGES } from "@/common/constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { useUnsavedChanges } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const CreateSupplier = () => {
  const { push } = useRouter();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const createSupplier = useCreateSupplier();
  const formRef = useRef(null);
  const supplierUnsaved = useUnsavedChanges({
    formRef,
    onDiscard: () => formRef.current?.resetForm(),
  });

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
    <>
      <SupplierForm ref={formRef} onSubmit={mutate} isLoading={isPending} />
      <UnsavedChangesModal
        open={supplierUnsaved.showModal}
        onDiscard={supplierUnsaved.handleDiscard}
        onContinue={supplierUnsaved.handleContinue}
      />
    </>
  )
};

export default CreateSupplier;
