"use client";
import { useUserContext } from "@/User";
import { useActiveProduct, useDeleteProduct, useEditProduct, useGetProduct, useInactiveProduct, useRecoverProduct } from "@/api/products";
import { Flex, Message, MessageHeader } from "@/common/components/custom";
import PrintBarCodes from "@/common/components/custom/PrintBarCodes";
import { TextField } from "@/common/components/form";
import { ModalAction } from "@/common/components/modals";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { ACTIVE, COLORS, ICONS, INACTIVE, PAGES, RECOVER } from "@/common/constants";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductChanges from "@/components/products/ProductChanges";
import ProductForm from "@/components/products/ProductForm";
import ProductStock from "@/components/products/ProductStock";
import { PRODUCT_STATES } from "@/components/products/products.constants";
import { isProductDeleted, isProductInactive, isProductOOS } from "@/components/products/products.utils";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useProtectedAction } from "@/hooks/useProtectedAction";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Tab } from "semantic-ui-react";
import { useUnsavedChanges } from "../../../hooks/unsavedChanges";

const Product = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: product, isLoading, refetch } = useGetProduct(params.code);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const printRef = useRef(null);
  const editProduct = useEditProduct();
  const deleteProduct = useDeleteProduct();
  const activeProduct = useActiveProduct();
  const inactiveProduct = useInactiveProduct();
  const recoverProduct = useRecoverProduct();
  const formRef = useRef(null);
  const {
    showModal: showUnsavedModal,
    handleDiscard,
    handleSave,
    resolveSave,
    handleCancel,
    isSaving,
    onBeforeView,
    closeModal,
  } = useUnsavedChanges({
    formRef,
    onDiscard: async () => {
      formRef.current?.resetForm();
      setIsUpdating(false);
    },
    onSave: () => {
      formRef.current?.submitForm();
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
    setLabels([
      PAGES.PRODUCTS.NAME,
      product?.code
        ? { id: product.code, title: PRODUCT_STATES[product.state]?.singularTitle, color: PRODUCT_STATES[product.state]?.color }
        : null
    ].filter(Boolean));
    refetch();
  }, [setLabels, product, refetch]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  const modalConfig = useMemo(() => ({
    softDelete: {
      header: `¿Está seguro que desea eliminar el producto "${product?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
      color: COLORS.RED
    },
    hardDelete: {
      header: `¿Está seguro que desea eliminar PERMANENTEMENTE el producto "${product?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
      color: COLORS.RED
    },
    recover: {
      header: `¿Está seguro que desea recuperar el producto "${product?.name}"?`,
      icon: ICONS.UNDO,
      color: COLORS.GREEN
    },
    active: {
      header: `¿Está seguro que desea activar el producto "${product?.name}"?`,
      icon: ICONS.PLAY_CIRCLE,
      color: COLORS.GREEN
    },
    inactive: {
      header: `¿Está seguro que desea desactivar el producto "${product?.name}"?`,
      icon: ICONS.PAUSE_CIRCLE,
      color: COLORS.GREY
    },
    outOfStock: {
      header: `¿Está seguro que desea cambiar el estado a sin stock el producto "${product?.name}"?`,
      icon: ICONS.BAN,
      color: COLORS.ORANGE
    },
    inStock: {
      header: `¿Está seguro que desea cambiar el estado a en stock el producto "${product?.name}"?`,
      icon: ICONS.BOX,
      color: COLORS.GREEN
    }
  }), [product]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setReason("");
  };

  const handleOpenModalWithAction = useCallback((action) => {
    setModalAction(action);
    setIsModalOpen(true);
  }, []);

  const handleActiveClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction(ACTIVE)),
    [handleOpenModalWithAction, handleProtectedAction]
  );

  const handleRecoverClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction("recover")),
    [handleOpenModalWithAction, handleProtectedAction]
  );

  const handleInactiveClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction(INACTIVE)),
    [handleOpenModalWithAction, handleProtectedAction]
  );
  const handleStockChangeClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction(isProductOOS(product?.state) ? "inStock" : "outOfStock")),
    [handleOpenModalWithAction, product?.state, handleProtectedAction]
  );

  const handleSoftDeleteClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction("softDelete")),
    [handleOpenModalWithAction, handleProtectedAction]
  );

  const handleHardDeleteClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction("hardDelete")),
    [handleOpenModalWithAction, handleProtectedAction]
  );

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: editProduct,
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Producto actualizado!");
        setIsUpdating(false);
        resolveSave();
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(`Error al actualizar el producto: ${error.message || error}`);
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
      closeModal();
    },
  });

  const { mutate: mutateActive, isPending: isActivePending } = useMutation({
    mutationFn: ({ product }) => activeProduct(product),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Producto activado!");
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(`Error al activar el producto: ${error.message || error}`);
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateInactive, isPending: isInactivePending } = useMutation({
    mutationFn: ({ product, reason }) => inactiveProduct(product, reason),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Producto desactivado!");
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(`Error al desactivar el producto: ${error.message || error}`);
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateRecover, isPending: isRecoverPending } = useMutation({
    mutationFn: () => recoverProduct(product),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Producto activado!");
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(`Error al activar el producto: ${error.message || error}`);
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: () => deleteProduct(product.code),
    onSuccess: (response) => {
      if (response.statusOk) {
        if (product.state === PRODUCT_STATES.DELETED.id) {
          toast.success("Producto eliminado permanentemente!");
          push(PAGES.PRODUCTS.BASE);
        } else {
          toast.success("Producto marcado como eliminado.");
        }
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(`Error al eliminar el producto: ${error.message || error}`);
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const handleActionConfirm = async () => {
    setActiveAction(modalAction);
    if (modalAction === "hardDelete") {
      mutateDelete();
    }

    if (modalAction === "softDelete") {
      if (product.state === PRODUCT_STATES.DELETED.id) {
        mutateDelete();
      } else {
        mutateEdit({ code: product.code, state: PRODUCT_STATES.DELETED.id });
      }
    }

    if (modalAction === INACTIVE) {
      if (!reason) {
        toast.error("Debe proporcionar una razón para desactivar el producto.");
        return;
      }
      mutateInactive({ product, reason });
    }

    if (modalAction === ACTIVE) {
      mutateActive({ product });
    }

    if (modalAction === "outOfStock") {
      mutateEdit({ code: product.code, state: PRODUCT_STATES.OOS.id });
    }

    if (modalAction === "inStock") {
      mutateEdit({ code: product.code, state: PRODUCT_STATES.ACTIVE.id });
    }

    if (modalAction === RECOVER) {
      mutateRecover();
    }

    handleModalClose();
  };


  const { header, confirmText = "", icon = ICONS.QUESTION, color } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === "softDelete" || modalAction === "hardDelete";

  useEffect(() => {
    if (product) {
      const actions = [
        {
          id: 1,
          icon: ICONS.BARCODE,
          color: COLORS.BLUE,
          onClick: () => setTimeout(handlePrint),
          text: "Código",
          loading: activeAction === "print",
          disabled: !!activeAction || isEditPending,
        },
      ];
      if (!isProductDeleted(product?.state) && !isProductInactive(product?.state)) {
        actions.push({
          id: 2,
          icon: isProductOOS(product?.state) ? ICONS.BOX : ICONS.BAN,
          color: COLORS.ORANGE,
          onClick: handleStockChangeClick,
          text: isProductOOS(product?.state) ? "En stock" : PRODUCT_STATES.OOS.singularTitle,
          width: "fit-content",
          loading: activeAction === "outOfStock",
          disabled: !!activeAction || isEditPending,
        });
      }
      if (!isProductDeleted(product?.state)) {
        actions.push({
          id: 3,
          icon: isProductInactive(product?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          onClick: isProductInactive(product?.state) ? handleActiveClick : handleInactiveClick,
          text: isProductInactive(product?.state) ? "Activar" : "Desactivar",
          width: "fit-content",
          loading: (activeAction === ACTIVE || activeAction === INACTIVE),
          disabled: !!activeAction || isEditPending,
        });
        actions.push({
          id: 4,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: handleSoftDeleteClick,
          text: "Eliminar",
          basic: true,
          loading: activeAction === "softDelete",
          disabled: !!activeAction || isEditPending,
        });
      }
      if (isProductDeleted(product?.state)) {
        actions.push({
          id: 5,
          icon: ICONS.UNDO,
          color: COLORS.GREEN,
          onClick: handleRecoverClick,
          text: "Recuperar",
          width: "fit-content",
          loading: activeAction === "recover",
          disabled: !!activeAction || isEditPending,
        });
        actions.push({
          id: 6,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: handleHardDeleteClick,
          text: "Eliminar",
          basic: true,
          loading: activeAction === "hardDelete",
          disabled: !!activeAction || isEditPending,
        });
      }

      setActions(actions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, activeAction, isEditPending, handleRecoverClick, handleActiveClick, handleInactiveClick, handleStockChangeClick, handleSoftDeleteClick, handleHardDeleteClick, setActions]);

  if (!isLoading && !product) {
    push(PAGES.NOT_FOUND.BASE);
  }

  const panes = [
    {
      menuItem: "Producto",
      render: () => (
        <Tab.Pane>
          {(!isProductDeleted(product?.state) && !isProductInactive(product?.state)) &&
            <Flex Flex $marginBottom="15px">
              {toggleButton}
            </Flex>
          }
          {isProductInactive(product?.state) && (
            <Message negative>
              <MessageHeader>Motivo de inactivación</MessageHeader>
              <p>{product.inactiveReason}</p>
            </Message>
          )}
          <ProductForm
            ref={formRef}
            product={product}
            onSubmit={mutateEdit}
            isUpdating={isUpdating && !isProductInactive(product?.state)}
            isLoading={isEditPending}
            view
            isDeletePending={isDeletePending}
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Historial de cambios",
      render: () => (
        <Tab.Pane>
          <ProductChanges product={product} />
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Control de stock",
      render: () => (
        <Tab.Pane>
          <ProductStock
            product={product}
          />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <Loader active={isLoading}>
      <Tab panes={panes} />
      <UnsavedChangesModal
        open={showUnsavedModal}
        onDiscard={handleDiscard}
        onSave={handleSave}
        isSaving={isSaving}
        onCancel={handleCancel}
      />
      {product && (
        <OnlyPrint>
          <PrintBarCodes singelProduct ref={printRef} products={[product]} />
        </OnlyPrint>
      )}
      <ModalAction
        title={header}
        titleIcon={icon}
        titleIconColor={color}
        onConfirm={handleActionConfirm}
        confirmationWord={requiresConfirmation ? confirmText : ""}
        showModal={isModalOpen}
        setShowModal={setIsModalOpen}
        isLoading={isInactivePending || isActivePending || isDeletePending || isEditPending || isRecoverPending}
        noConfirmation={!requiresConfirmation && modalAction !== INACTIVE}
        bodyContent={
          modalAction === INACTIVE ? (
            <TextField
              placeholder="Motivo"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          ) : null
        }
        requireReason={modalAction === INACTIVE}
        reason={reason}
      />
    </Loader>
  );
};

export default Product;
