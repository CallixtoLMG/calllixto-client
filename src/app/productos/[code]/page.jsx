"use client";
import { useUserContext } from "@/User";
import { useActiveProduct, useDeleteProduct, useEditProduct, useGetProduct, useInactiveProduct } from "@/api/products";
import { Input } from "@/components/common/custom";
import PrintBarCodes from "@/components/common/custom/PrintBarCodes";
import { ModalAction } from "@/components/common/modals";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import ProductView from "@/components/products/ProductView";
import { COLORS, ICONS, PAGES, PRODUCT_STATES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { isItemInactive, isProductDeleted, isProductInactive, isProductOOS } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

const Product = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: product, isLoading } = useGetProduct(params.code);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { isUpdating, toggleButton }  = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const printRef = useRef(null);
  const editProduct = useEditProduct();
  const deleteProduct = useDeleteProduct();
  const activeProduct = useActiveProduct();
  const inactiveProduct = useInactiveProduct();
  const isProductOOSState = useMemo(() => isProductOOS(product?.state), [product?.state]);

  const stateTitle = useMemo(() => {
    return product?.state ? PRODUCT_STATES[product.state]?.singularTitle || PRODUCT_STATES.INACTIVE.singularTitle : PRODUCT_STATES.INACTIVE.singularTitle;
  }, [product?.state]);

  const stateColor = useMemo(() => {
    return product?.state ? PRODUCT_STATES[product.state]?.color || PRODUCT_STATES.INACTIVE.color : PRODUCT_STATES.INACTIVE.color;
  }, [product?.state]);

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([
      PAGES.PRODUCTS.NAME,
      product?.code ? { id: product.code, title: stateTitle, color: stateColor } : null
    ].filter(Boolean));
  }, [setLabels, product, stateTitle, stateColor]);

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
  const handleActiveClick = useCallback(() => handleOpenModalWithAction("active"), [handleOpenModalWithAction]);
  const handleInactiveClick = useCallback(() => handleOpenModalWithAction("inactive"), [handleOpenModalWithAction]);
  const handleStockChangeClick = useCallback(() => handleOpenModalWithAction(isProductOOSState ? "inStock" : "outOfStock"), [handleOpenModalWithAction, isProductOOSState]);
  const handleSoftDeleteClick = useCallback(() => handleOpenModalWithAction("softDelete"), [handleOpenModalWithAction]);
  const handleHardDeleteClick = useCallback(() => handleOpenModalWithAction("hardDelete"), [handleOpenModalWithAction]);

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: async (product) => {
      const data = await editProduct(product);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Producto actualizado!");
        push(PAGES.PRODUCTS.BASE);
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
    mutationFn: async ({ product }) => {
      const response = await activeProduct(product);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Producto activado!");
        push(PAGES.PRODUCTS.BASE);
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
    mutationFn: async ({ product, reason }) => {
      const response = await inactiveProduct(product, reason);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Producto desactivado!");
        push(PAGES.PRODUCTS.BASE);
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
    mutationFn: async () => {
      const response = await deleteProduct(product.code);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        if (product.state === PRODUCT_STATES.DELETED.id) {
          toast.success("Producto eliminado permanentemente!");
        } else {
          toast.success("Producto marcado como eliminado.");
        }
        push(PAGES.PRODUCTS.BASE);
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
    } else if (modalAction === "softDelete") {
      if (product.state === PRODUCT_STATES.DELETED.id) {
        mutateDelete();
      } else {
        const updatedProduct = { ...product, state: PRODUCT_STATES.DELETED.id };
        mutateEdit(updatedProduct);
      }
    } else if (modalAction === "inactive") {
      if (!reason) {
        toast.error("Debe proporcionar una razón para desactivar el producto.");
        return;
      }
      mutateInactive({ product, reason });

    } else if (modalAction === "active") {
      mutateActive({ product });

    } else if (modalAction === "outOfStock") {
      const updatedProduct = { ...product, state: PRODUCT_STATES.OOS.id };
      mutateEdit(updatedProduct);

    } else if (modalAction === "inStock") {
      const updatedProduct = { ...product, state: PRODUCT_STATES.ACTIVE.id };
      mutateEdit(updatedProduct);

    } else if (modalAction === "recover") {
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
          disabled: !!activeAction,
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
          loading: activeAction === "outOfStock" || isEditPending,
          disabled: !!activeAction,
        });
      }
      if (!isProductDeleted(product?.state)) {
        actions.push({
          id: 3,
          icon: isItemInactive(product?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          onClick: isItemInactive(product?.state) ? handleActiveClick : handleInactiveClick,
          text: isItemInactive(product?.state) ? "Activar" : "Desactivar",
          width: "fit-content",
          loading: (activeAction === "active" || activeAction === "inactive"),
          disabled: !!activeAction,
        });
        actions.push({
          id: 4,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: handleSoftDeleteClick,
          text: "Eliminar",
          basic: true,
          loading: activeAction === "softDelete",
          disabled: !!activeAction,
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
          disabled: !!activeAction,
        });
        actions.push({
          id: 6,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: handleHardDeleteClick,
          text: "Eliminar",
          basic: true,
          loading: activeAction === "hardDelete",
          disabled: !!activeAction,
        });
      }

      setActions(actions);
    }
  }, [product, activeAction, handleRecoverClick, handleActiveClick, handleInactiveClick, handleStockChangeClick, handleSoftDeleteClick, handleHardDeleteClick, setActions]);

  if (!isLoading && !product) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading}>
      {!isProductDeleted(product?.state) && toggleButton}
      {isUpdating ? (
        <ProductForm
          product={product}
          onSubmit={mutateEdit}
          isUpdating
          isLoading={isEditPending}
        />
      ) : (
        <ProductView product={product} />
      )}
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
        noConfirmation={!requiresConfirmation && modalAction !== "inactive"}
        bodyContent={
          modalAction === "inactive" ? (
            <Input
              type="text"
              placeholder="Indique la razón de desactivación"
              value={reason}
              onChange={(e) => setReason(e.target.value)} 
            />
          ) : null
        }
        requireReason={modalAction === "inactive"} 
        reason={reason} 
      />
    </Loader>
  );
};

export default Product;
