"use client";
import { useUserContext } from "@/User";
import { useDeleteBrand, useEditBrand, useSetBrandState } from "@/api/brands";
import { useHasProductsByBrandId } from "@/api/products";
import { FieldsContainer, FormField, Message, MessageHeader } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import ModalAction from "@/common/components/modals/ModalAction";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { ACTIVE, COLORS, DELETE, ICONS, INACTIVE, PAGES, PLACEHOLDERS } from "@/common/constants";
import { isItemInactive } from "@/common/utils";
import BrandForm from "@/components/brands/BrandForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useAllowUpdate, useProtectedAction, useUnsavedChanges } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

const BrandPage = ({ brand: initialBrand }) => {
  const { role } = useUserContext();
  const { push } = useRouter();
  const [brand, setBrand] = useState(initialBrand);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const editBrand = useEditBrand();
  const formRef = useRef(null);

  const {
    showModal: showUnsavedModal,
    handleDiscard,
    handleContinue,
    onBeforeView,
    closeModal,
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

  const deleteBrand = useDeleteBrand();
  const setBrandState = useSetBrandState();

  const { hasAssociatedProducts, isLoadingProducts } = useHasProductsByBrandId(brand?.id);
  const { handleProtectedAction } = useProtectedAction({ formRef, onBeforeView });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.BRANDS.NAME }, { name: brand?.name }]);
  }, [setLabels, brand]);

  const modalConfig = useMemo(() => ({
    delete: {
      header: (
        <>¿Está seguro que desea eliminar la marca <i>{brand?.name} ({brand?.id}) </i> ?</>
      ),
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    active: {
      header: (
        <>¿Está seguro que desea activar la marca <i>{brand?.name} ({brand?.id}) </i> ?</>
      ),
      icon: ICONS.PLAY_CIRCLE
    },
    inactive: {
      header: (
        <>¿Está seguro que desea desactivar la marca <i>{brand?.name} ({brand?.id}) </i> ?</>
      ),
      icon: ICONS.PAUSE_CIRCLE
    },
  }), [brand]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setReason("");
  };

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: editBrand,
    onSuccess: (response) => {
      if (response.statusOk) {
        setBrand((currentBrand) => response.brand ?? currentBrand);
        toast.success("Marca actualizada!");
        setIsUpdating(false);
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
      closeModal();
    },
  });


  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: () => deleteBrand(brand.id),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Marca eliminada permanentemente!");
        push(PAGES.BRANDS.BASE);
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateState, isPending: isMutateStatePending } = useMutation({
    mutationFn: setBrandState,
    onSuccess: (response, variables) => {
      if (response.statusOk) {
        setBrand((currentBrand) => response.brand ?? currentBrand);
        toast.success(
          variables.state === ACTIVE
            ? 'Marca activada!'
            : 'Marca desactivada!'
        );
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const handleActionConfirm = async () => {
    if (modalAction === INACTIVE && !reason) {
      toast.error("Debe proporcionar una razón para desactivar la marca.");
      return;
    }

    setActiveAction(modalAction);

    if (modalAction === DELETE) {
      mutateDelete();
    }

    if (modalAction === ACTIVE || modalAction === INACTIVE) {
      mutateState({
        id: brand.id,
        state: modalAction,
        ...(modalAction === INACTIVE && { inactiveReason: reason }),
      });
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === DELETE;

  useEffect(() => {
    if (brand) {
      const handleClick = (action) => () => handleProtectedAction(() => {
        setModalAction(action);
        setIsModalOpen(true);
      });

      const actions = RULES.canRemove[role] ? [
        {
          id: 1,
          icon: isItemInactive(brand?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          text: isItemInactive(brand?.state) ? "Activar" : "Desactivar",
          onClick: handleClick(isItemInactive(brand?.state) ? ACTIVE : INACTIVE),
          loading: (activeAction === ACTIVE || activeAction === INACTIVE),
          disabled: !!activeAction,
          iconOnly:true
        },
        {
          id: 2,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          text: "Eliminar",
          basic: true,
          onClick: handleClick(DELETE),
          loading: activeAction === DELETE,
          disabled: hasAssociatedProducts || !!activeAction,
          tooltip: hasAssociatedProducts ? "No se puede eliminar esta marca, existen productos asociados." : false,
          iconOnly:true
        },
      ] : [];
      setActions(actions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, brand, activeAction, isMutateStatePending, isDeletePending, setActions, hasAssociatedProducts]);

  return (
    <Loader active={isLoadingProducts}>
      {!isItemInactive(brand?.state) && toggleButton}
      {isItemInactive(brand?.state) && (
        <FieldsContainer>
          <FormField flex="1">
            <Message negative>
              <MessageHeader>Motivo de inactivación</MessageHeader>
              <p>{brand.inactiveReason}</p>
            </Message>
          </FormField>
          <FormField flex="1" />
          <FormField flex="1" />
        </FieldsContainer>
      )}
      <BrandForm
        ref={formRef}
        brand={brand}
        onSubmit={mutateEdit}
        isLoading={isEditPending}
        isUpdating={isUpdating && !isItemInactive(brand?.state)}
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
            <TextField
              placeholder={PLACEHOLDERS.REASON}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )
        }
      />
    </Loader>
  );
};

export default BrandPage;
