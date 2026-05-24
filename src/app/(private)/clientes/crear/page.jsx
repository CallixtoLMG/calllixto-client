"use client";
import { useCreateCustomer } from "@/api/customers";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { PAGES } from "@/common/constants";
import CustomerForm from "@/components/customers/CustomerForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useUnsavedChanges } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const CreateCustomer = () => {
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setInfo } = useNavActionsContext();
  const { push } = useRouter();
  const createCustomer = useCreateCustomer();
  const formRef = useRef(null);
  const customerUnsaved = useUnsavedChanges({
    formRef,
    onDiscard: () => formRef.current?.resetForm(),
  });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.CUSTOMERS.NAME }, { name: 'Crear' }]);
    setInfo(null);
  }, [setLabels, setInfo]);

  const { mutate, isPending } = useMutation({
    mutationFn: createCustomer,
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.CUSTOMERS.SHOW(response.customer.id))
        toast.success('Cliente creado!');
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <>
      <CustomerForm
        ref={formRef}
        onSubmit={mutate}
        isLoading={isPending}
      />
      <UnsavedChangesModal
        open={customerUnsaved.showModal}
        onDiscard={customerUnsaved.handleDiscard}
        onContinue={customerUnsaved.handleContinue}
      />
    </>
  )
};

export default CreateCustomer;
