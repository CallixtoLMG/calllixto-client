"use client";
import { useUserContext } from "@/User";
import { useListBudgets } from "@/api/budgets";
import { useActiveUser, useDeleteUser, useEditUser, useGetUser, useInactiveUser } from "@/api/users";
import { Input } from "@/components/common/custom";
import ModalAction from "@/components/common/modals/ModalAction";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { COLORS, ICONS, PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { isItemInactive } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import UserForm from "../../../components/users/UserForm";
import UserView from "../../../components/users/UserView";

const User = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: user, isLoading, refetch } = useGetUser(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { isUpdating, toggleButton } = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const editUser = useEditUser();
  const deleteUser = useDeleteUser();
  const activeUser = useActiveUser();
  const inactiveUser = useInactiveUser();
  const { data: budgetData, isLoading: isLoadingBudgets } = useListBudgets();

  const hasAssociatedBudgets = useMemo(() => {
    return budgetData?.budgets?.some(budget => budget.user?.id === user?.id);
  }, [budgetData, user]);

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.USERS.NAME, user?.name]);
    refetch();
  }, [setLabels, user, refetch]);

  const modalConfig = useMemo(() => ({
    delete: {
      header: `¿Está seguro que desea eliminar el usuario "${user?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    active: {
      header: `¿Está seguro que desea activar el usuario ${user?.id}?`,
      icon: ICONS.PLAY_CIRCLE
    },
    inactive: {
      header: `¿Está seguro que desea desactivar el usuario ${user?.id}?`,
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

  const handleActivateClick = useCallback(() => handleOpenModalWithAction("active"), [handleOpenModalWithAction]);
  const handleInactiveClick = useCallback(() => handleOpenModalWithAction("inactive"), [handleOpenModalWithAction]);
  const handleDeleteClick = useCallback(() => handleOpenModalWithAction("delete"), [handleOpenModalWithAction]);

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
      const response = await activeUser(user);
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
      const response = await inactiveUser(user, reason);
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
    mutationFn: () => {
      return deleteUser(params.id);
    },
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

    if (modalAction === "delete") {
      mutateDelete();
    } else if (modalAction === "inactive") {
      if (!reason) {
        toast.error("Debe proporcionar una razón para desactivar el usuario.");
        return;
      }
      mutateInactive({ user, reason });
    } else if (modalAction === "active") {
      mutateActive({ user });
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === "delete";

  useEffect(() => {
    if (user) {
      const actions = RULES.canRemove[role] ? [
        {
          id: 1,
          icon: isItemInactive(user?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          text: isItemInactive(user?.state) ? "Activar" : "Desactivar",
          onClick: isItemInactive(user?.state) ? handleActivateClick : handleInactiveClick,
          loading: (activeAction === "active" || activeAction === "inactive"),
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
          loading: activeAction === "delete",
          disabled: hasAssociatedBudgets || !!activeAction,
          tooltip: hasAssociatedBudgets ? "No se puede eliminar este usuario, existen presupuestos asociados." : false,
        },
      ] : [];

      setActions(actions);
    }
  }, [role, user, activeAction, isActivePending, isInactivePending, isDeletePending, handleActivateClick, handleInactiveClick, handleDeleteClick, setActions, hasAssociatedBudgets]);

  if (!isLoading && !user) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || isLoadingBudgets}>
      {toggleButton}
      {isUpdating ? (
        <UserForm user={user} onSubmit={mutateEdit} isLoading={isEditPending} isUpdating />
      ) : (
        <UserView user={user} />
      )}
      <ModalAction
        title={header}
        onConfirm={handleActionConfirm}
        confirmationWord={requiresConfirmation ? confirmText : ""}
        confirmButtonIcon={icon}
        showModal={isModalOpen}
        setShowModal={handleModalClose}
        isLoading={isDeletePending || isInactivePending || isActivePending}
        noConfirmation={!requiresConfirmation}
        disableButtons={!reason && modalAction === "inactive"}
        bodyContent={
          modalAction === "inactive" && (
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
