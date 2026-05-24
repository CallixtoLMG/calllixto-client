"use client";
import { useCreateBrand } from "@/api/brands";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { PAGES } from "@/common/constants";
import BrandForm from "@/components/brands/BrandForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useUnsavedChanges } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const CreateBrand = () => {
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { push } = useRouter();
  const createBrand = useCreateBrand();
  const formRef = useRef(null);
  const brandUnsaved = useUnsavedChanges({
    formRef,
    onDiscard: () => formRef.current?.resetForm(),
  });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.BRANDS.NAME }, { name: 'Crear' }]);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: createBrand,
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.BRANDS.SHOW(response.brand.id))
        toast.success('Marca creada!');
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }
    },
  });

  return (
    <>
      <BrandForm ref={formRef} onSubmit={mutate} isLoading={isPending} />
      <UnsavedChangesModal
        open={brandUnsaved.showModal}
        onDiscard={brandUnsaved.handleDiscard}
        onContinue={brandUnsaved.handleContinue}
      />
    </>
  )
};

export default CreateBrand;
