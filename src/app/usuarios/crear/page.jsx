"use client";
import { useCreateUser } from "@/api/users";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { PAGES } from "@/common/constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import UserForm from "@/components/users/UserForm";
import { useUnsavedChanges, useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const CreateUser = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { push } = useRouter();
  const createUser = useCreateUser();
  const formRef = useRef(null);
  const userUnsaved = useUnsavedChanges({
    formRef,
    onDiscard: () => formRef.current?.resetForm(),
  });
  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.USERS.NAME }, { name: 'Crear' }]);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: createUser,
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.USERS.SHOW(response.user.username))
        toast.success('Usuario creado!');
      } else {
        toast.error(response.error.name === "UsernameExistsException" ? "El usuario ya existe" : response.message);
      }
    },
  });

  return (
    <>
      <UserForm ref={formRef} onSubmit={mutate} isLoading={isPending} />
      <UnsavedChangesModal
        open={userUnsaved.showModal}
        onDiscard={userUnsaved.handleDiscard}
        onContinue={userUnsaved.handleContinue}
      />
    </>
  )
};

export default CreateUser;
