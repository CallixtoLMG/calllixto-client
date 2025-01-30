"use client";
import { useUserContext } from "@/User";
import { useActiveProduct, useDeleteProduct, useEditProduct, useGetProduct, useInactiveProduct } from "@/api/products";
import { Message, MessageHeader } from "@/components/common/custom";
import PrintBarCodes from "@/components/common/custom/PrintBarCodes";
import { ModalAction } from "@/components/common/modals";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { ACTIVE, COLORS, ICONS, INACTIVE, PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { isProductDeleted, isProductInactive, isProductOOS } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { PRODUCT_STATES } from "@/components/products/products.common";
import { TextField } from "../../../components/common/form";

const Product = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: product, isLoading, refetch } = useGetProduct(params.code);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { isUpdating, toggleButton, setIsUpdating } = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const printRef = useRef(null);

  const editProduct = useEditProduct();
  const deleteProduct = useDeleteProduct();
  const activeProduct = useActiveProduct();
  const inactiveProduct = useInactiveProduct();

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
    refetch()
  }, [setLabels, product, refetch]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  const modalConfig = useMemo(() => ({
    softDelete: {
      header: "¿Está seguro que desea eliminar este producto?",
      confirmText: "eliminar",
      icon: ICONS.TRASH
    },
    hardDelete: {
      header: "¿Está seguro que desea eliminar PERMANENTEMENTE este producto?",
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    recover: {
      header: "¿Está seguro que desea recuperar el producto?",
      icon: ICONS.UNDO
    },
    active: {
      header: "¿Está seguro que desea activar el producto?",
      icon: ICONS.PLAY_CIRCLE
    },
    inactive: {
      header: "¿Está seguro que desea desactivar el producto?",
      icon: ICONS.PAUSE_CIRCLE
    },
    outOfStock: {
      header: "¿Está seguro que desea cambiar el estado a sin stock?",
      icon: ICONS.BAN
    },
    inStock: {
      header: "¿Está seguro que desea cambiar el estado a en stock?",
      icon: ICONS.BOX
    }
  }), []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setReason("");
  };

  const handleOpenModalWithAction = useCallback((action) => {
    setModalAction(action);
    setIsModalOpen(true);
  }, []);

  const handleRecoverClick = useCallback(() => handleOpenModalWithAction("recover"), [handleOpenModalWithAction]);
  const handleActiveClick = useCallback(() => handleOpenModalWithAction(ACTIVE), [handleOpenModalWithAction]);
  const handleInactiveClick = useCallback(() => handleOpenModalWithAction(INACTIVE), [handleOpenModalWithAction]);
  const handleStockChangeClick = useCallback(() => handleOpenModalWithAction(isProductOOS(product?.state) ? "inStock" : "outOfStock"), [handleOpenModalWithAction, product?.state]);
  const handleSoftDeleteClick = useCallback(() => handleOpenModalWithAction("softDelete"), [handleOpenModalWithAction]);
  const handleHardDeleteClick = useCallback(() => handleOpenModalWithAction("hardDelete"), [handleOpenModalWithAction]);

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: (product) => editProduct(product),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Producto actualizado!");
        setIsUpdating(false);
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
        const updatedProduct = { ...product, state: PRODUCT_STATES.DELETED.id };
        mutateEdit(updatedProduct);
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
      const updatedProduct = { ...product, state: PRODUCT_STATES.OOS.id };
      mutateEdit(updatedProduct);
    }

    if (modalAction === "inStock") {
      const updatedProduct = { ...product, state: PRODUCT_STATES.ACTIVE.id };
      mutateEdit(updatedProduct);
    }

    if (modalAction === "recover") {
      const updatedProduct = { ...product, state: PRODUCT_STATES.ACTIVE.id };
      mutateEdit(updatedProduct);
    }

    handleModalClose();
  };


  const { header = "", confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
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

  return (
    <Loader active={isLoading}>
      {!isProductDeleted(product?.state) && !isProductInactive(product?.state) && toggleButton}
      {isProductInactive(product?.state) && (
        <Message negative>
          <MessageHeader>Motivo de inactivación</MessageHeader>
          <p>{product.inactiveReason}</p>
        </Message>
      )}
      <ProductForm
        product={product}
        onSubmit={mutateEdit}
        isUpdating={isUpdating && !isProductInactive(product?.state)}
        isLoading={isEditPending}
        view
      />
      {product && (
        <OnlyPrint>
          <PrintBarCodes singelProduct ref={printRef} products={[product]} />
        </OnlyPrint>
      )}
      <ModalAction
        title={header}
        onConfirm={handleActionConfirm}
        confirmationWord={requiresConfirmation ? confirmText : ""}
        confirmButtonIcon={icon}
        showModal={isModalOpen}
        setShowModal={setIsModalOpen}
        isLoading={isInactivePending || isActivePending || isDeletePending || isEditPending}
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
