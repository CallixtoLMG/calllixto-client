"use client";
import { useUserContext } from "@/User";
import { useDeleteUser, useEditUser, useGetUser, useSetUserState } from "@/api/users";
import { Input, Message, MessageHeader } from "@/common/components/custom";
import { ModalAction } from "@/common/components/modals";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { ACTIVE, COLORS, DELETE, ICONS, INACTIVE, PAGES } from "@/common/constants";
import { isItemInactive } from "@/common/utils";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import UserForm from "@/components/users/UserForm";
import { useAllowUpdate, useProtectedAction, useUnsavedChanges, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

const User = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: user, isLoading, refetch } = useGetUser(decodeURIComponent(params.username));
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const editUser = useEditUser();
  const deleteUser = useDeleteUser();
  const setUserState = useSetUserState();

  const formRef = useRef(null);

  const {
    showModal: showUnsavedModal,
    handleDiscard,
    handleContinue,
    onBeforeView,
  } = useUnsavedChanges({
    formRef,
    onDiscard: async () => {
      formRef.current?.resetForm();
      setIsUpdating(false);
    },
  });

  const { isUpdating, toggleButton, setIsUpdating } = useAllowUpdate({
    canUpdate: RULES.canUpdate[role],
    onBeforeView,
  });
  const { handleProtectedAction } = useProtectedAction({ formRef, onBeforeView });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.USERS.NAME }, { name: user && `${user?.firstName} ${user?.lastName}` }]);
    refetch();
  }, [setLabels, user, refetch]);

  const modalConfig = useMemo(() => ({
    delete: {
      header: `¿Está seguro que desea eliminar el usuario "${user?.username}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    active: {
      header: `¿Está seguro que desea activar el usuario ${user?.username}?`,
      icon: ICONS.PLAY_CIRCLE
    },
    inactive: {
      header: `¿Está seguro que desea desactivar el usuario ${user?.username}?`,
      icon: ICONS.PAUSE_CIRCLE
    },
  }), [user]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setReason("");
  };

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: editUser,
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Usuario actualizado!");
        setIsUpdating(false);
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
      closeModal();
    },
  });

  const { mutate: mutateState, isPending: isMutateStatePending } = useMutation({
    mutationFn: setUserState,
    onSuccess: (response, variables) => {
      if (response.statusOk) {
        toast.success(
          variables.state === ACTIVE
            ? 'Usuario activado!'
            : 'Usuario desactivado!'
        );
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: () => deleteUser(decodeURIComponent(params.username)),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Usuario eliminado permanentemente!");
        push(PAGES.USERS.BASE);
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const handleActionConfirm = async () => {
    if (modalAction === INACTIVE && !reason) {
      toast.error("Debe proporcionar una razón para desactivar al usuario.");
      return;
    }
    setActiveAction(modalAction);

    if (modalAction === DELETE) {
      mutateDelete();
    }

    if (modalAction === ACTIVE || modalAction === INACTIVE) {
      mutateState({
        username: user.username,
        state: modalAction,
        ...(modalAction === INACTIVE && { inactiveReason: reason }),
      });
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === DELETE;

  useEffect(() => {
    if (user) {
      const handleClick = (action) => () => handleProtectedAction(() => {
        setModalAction(action);
        setIsModalOpen(true);
      });

      let actions = [];

      if (RULES.canUpdate[role]) {
        actions = [
          {
            id: 1,
            icon: isItemInactive(user?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
            color: COLORS.GREY,
            text: isItemInactive(user?.state) ? "Activar" : "Desactivar",
            onClick: handleClick(isItemInactive(user?.state) ? ACTIVE : INACTIVE),
            loading: (activeAction === ACTIVE || activeAction === INACTIVE),
            disabled: !!activeAction,
            width: "fit-content",
          },
          {
            id: 2,
            icon: ICONS.TRASH,
            color: COLORS.RED,
            text: "Eliminar",
            basic: true,
            onClick: handleClick(DELETE),
            loading: activeAction === DELETE,
            disabled: !!activeAction,
          },
        ];
      }

      setActions(actions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user, activeAction, isMutateStatePending, isDeletePending, setActions]);

  if (!isLoading && !user) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || !user}>
      {!isItemInactive(user?.state) && toggleButton}
      {isItemInactive(user?.state) && (
        <Message negative>
          <MessageHeader>Motivo de inactivación</MessageHeader>
          <p>{user.inactiveReason}</p>
        </Message>
      )}
      <UserForm
        ref={formRef}
        user={user}
        onSubmit={mutateEdit}
        isLoading={isEditPending}
        isUpdating={isUpdating && !isItemInactive(user?.state)}
        view
        isDeletePending={isDeletePending}
      />
<UnsavedChangesModal
  open={showUnsavedModal}
  onDiscard={handleDiscard}
  onContinue={handleContinue}
/>
      <ModalAction
        title={header}
        onConfirm={handleActionConfirm}
        confirmationWord={requiresConfirmation ? confirmText : ""}
        confirmButtonIcon={icon}
        showModal={isModalOpen}
        setShowModal={handleModalClose}
        isLoading={isDeletePending || isMutateStatePending}
        noConfirmation={!requiresConfirmation}
        disableButtons={!reason && modalAction === INACTIVE}
        bodyContent={
          modalAction === INACTIVE && (
            <Input
              type="text"
              placeholder="Motivo"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )
        }
      />
    </Loader>
  );
};

export default User;