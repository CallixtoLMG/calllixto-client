"use client";
import { useUserContext } from "@/User";
import { useActiveBrand, useDeleteBrand, useEditBrand, useGetBrand, useInactiveBrand } from "@/api/brands";
import { useHasProductsByBrandId } from "@/api/products";
import BrandForm from "@/components/brands/BrandForm";
import { Message, MessageHeader } from "@/components/common/custom";
import { TextField } from "@/components/common/form";
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

const Brand = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: brand, isLoading, refetch } = useGetBrand(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { isUpdating, toggleButton, setIsUpdating } = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const editBrand = useEditBrand();
  const deleteBrand = useDeleteBrand();
  const activeBrand = useActiveBrand();
  const inactiveBrand = useInactiveBrand();
  const { hasAssociatedProducts, isLoadingProducts } = useHasProductsByBrandId(brand?.id);

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.BRANDS.NAME, brand?.name]);
    refetch();
  }, [setLabels, brand, refetch]);

  const modalConfig = useMemo(() => ({
    delete: {
      header: `¿Está seguro que desea eliminar la marca "${brand?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    active: {
      header: `¿Está seguro que desea activar el cliente ${brand?.id}?`,
      icon: ICONS.PLAY_CIRCLE
    },
    inactive: {
      header: `¿Está seguro que desea desactivar el cliente ${brand?.id}?`,
      icon: ICONS.PAUSE_CIRCLE
    },
  }), [brand]);

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
    mutationFn: (brand) => editBrand(brand),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Marca actualizada!");
        setIsUpdating(false);
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
    mutationFn: ({ brand }) => activeBrand(brand),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Marca activada!");
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
    mutationFn: ({ brand, reason }) => inactiveBrand(brand, reason),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Marca desactivada!");
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
    mutationFn: () => deleteBrand(params.id),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Marca eliminada permanentemente!");
        push(PAGES.BRANDS.BASE);
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
    }

    if (modalAction === "inactive") {
      if (!reason) {
        toast.error("Debe proporcionar una razón para desactivar la marca.");
        return;
      }
      mutateInactive({ brand, reason });
    }

    if (modalAction === "active") {
      mutateActive({ brand });
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === "delete";

  useEffect(() => {
    if (brand) {
      const actions = RULES.canRemove[role] ? [
        {
          id: 1,
          icon: isItemInactive(brand?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          text: isItemInactive(brand?.state) ? "Activar" : "Desactivar",
          onClick: isItemInactive(brand?.state) ? handleActivateClick : handleInactiveClick,
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
          disabled: hasAssociatedProducts || !!activeAction,
          tooltip: hasAssociatedProducts ? "No se puede eliminar esta marca, existen productos asociados." : false,
        },
      ] : [];
      setActions(actions);
    }
  }, [role, brand, activeAction, isActivePending, isInactivePending, isDeletePending, handleActivateClick, handleInactiveClick, handleDeleteClick, setActions, hasAssociatedProducts]);

  if (!isLoading && !brand) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || isLoadingProducts}>
      {toggleButton}
      {isItemInactive(brand?.state) && (
        <Message negative>
          <MessageHeader>Motivo de inactivación</MessageHeader>
          <p>{brand.inactiveReason}</p>
        </Message>
      )}
      <BrandForm
        brand={brand}
        onSubmit={mutateEdit}
        isLoading={isEditPending}
        isUpdating={isUpdating && !isItemInactive(brand?.state)}
        view
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
        disableButtons={!reason && modalAction === "inactive"}
        bodyContent={
          modalAction === "inactive" && (
            <TextField
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

export default Brand;
