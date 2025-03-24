"use client";
import { useUserContext } from "@/User";
import { useActiveUser, useDeleteUser, useEditUser, useGetUser, useInactiveUser } from "@/api/users";
import { Input, Message, MessageHeader } from "@/common/components/custom";
import { ModalAction } from "@/common/components/modals";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { ACTIVE, COLORS, DELETE, ICONS, INACTIVE_LOW_CASE, PAGES } from "@/common/constants";
import { isItemInactive } from "@/common/utils";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import UserForm from "@/components/users/UserForm";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useUnsavedChanges } from "../../../hooks/unsavedChanges";

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
  const activeUser = useActiveUser();
  const inactiveUser = useInactiveUser();

  const formRef = useRef(null);
  const {
    showModal: showUnsavedModal,
    onBeforeView,
    handleDiscard,
    handleSave,
    isSaving
  } = useUnsavedChanges({
    formRef,
    onDiscard: () => {
      formRef.current?.resetForm();
      setIsUpdating(false);
    },
    onSave: async () => {
      await formRef.current?.submitForm();
      setIsUpdating(false);
    }
  });
  const { isUpdating, toggleButton, setIsUpdating } = useAllowUpdate({
    canUpdate: RULES.canUpdate[role],
    onBeforeView,
  });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.USERS.NAME, user && `${user?.firstName} ${user?.lastName}`]);
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

  const handleOpenModalWithAction = useCallback((action) => {
    setModalAction(action);
    setIsModalOpen(true);
  }, []);

  const handleActivateClick = useCallback(() => handleOpenModalWithAction(ACTIVE), [handleOpenModalWithAction]);
  const handleInactiveClick = useCallback(() => handleOpenModalWithAction(INACTIVE_LOW_CASE), [handleOpenModalWithAction]);
  const handleDeleteClick = useCallback(() => handleOpenModalWithAction(DELETE), [handleOpenModalWithAction]);

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: async (user) => {
      const data = await editUser(user);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Usuario actualizado!");
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateActive, isPending: isActivePending } = useMutation({
    mutationFn: async ({ user }) => {
      const response = await activeUser(user.username);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Usuario activado!");
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateInactive, isPending: isInactivePending } = useMutation({
    mutationFn: async ({ user, reason }) => {
      const response = await inactiveUser(user.username, reason);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Usuario desactivado!");
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
    setActiveAction(modalAction);
    if (modalAction === DELETE) {
      mutateDelete();
    }
    if (modalAction === INACTIVE_LOW_CASE && !reason) {
      toast.error("Debe proporcionar una razón para desactivar el usuario.");
      return;
    }
    if (modalAction === INACTIVE_LOW_CASE) {
      mutateInactive({ user, reason });
    }
    if (modalAction === ACTIVE) {
      mutateActive({ user });
    }
    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === DELETE;

  useEffect(() => {
    if (user) {
      const actions = RULES.canRemove[role] ? [
        {
          id: 1,
          icon: isItemInactive(user?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          text: isItemInactive(user?.state) ? "Activar" : "Desactivar",
          onClick: isItemInactive(user?.state) ? handleActivateClick : handleInactiveClick,
          loading: (activeAction === ACTIVE || activeAction === INACTIVE_LOW_CASE),
          disabled: !!activeAction,
          width: "fit-content",
        },
        {
          id: 2,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          text: "Eliminar",
          basic: true,
          onClick: handleDeleteClick,
          loading: activeAction === DELETE,
          disabled: !!activeAction,
        },
      ] : [];

      setActions(actions);
    }
  }, [role, user, activeAction, isActivePending, isInactivePending, isDeletePending, handleActivateClick, handleInactiveClick, handleDeleteClick, setActions]);

  if (!isLoading && !user) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading}>
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
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
      />
      <ModalAction
        title={header}
        onConfirm={handleActionConfirm}
        confirmationWord={requiresConfirmation ? confirmText : ""}
        confirmButtonIcon={icon}
        showModal={isModalOpen}
        setShowModal={handleModalClose}
        isLoading={isDeletePending || isInactivePending || isActivePending}
        noConfirmation={!requiresConfirmation}
        disableButtons={!reason && modalAction === INACTIVE_LOW_CASE}
        bodyContent={
          modalAction === INACTIVE_LOW_CASE && (
            <Input
              type="text"
              placeholder="Indique el razón de desactivación"
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