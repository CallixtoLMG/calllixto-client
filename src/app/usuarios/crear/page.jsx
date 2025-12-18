"use client";
import { useCreateUser } from "@/api/users";
import { PAGES } from "@/common/constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import UserForm from "@/components/users/UserForm";
import { useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CreateUser = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { push } = useRouter();
  const createUser = useCreateUser();
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
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <UserForm onSubmit={mutate} isLoading={isPending} />
  )
};

export default CreateUser;