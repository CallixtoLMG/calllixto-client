"use client";
import { useUserContext } from "@/User";
import { GET_PRODUCT_QUERY_KEY, LIST_PRODUCTS_QUERY_KEY, deleteProduct, editProduct, useGetProduct } from "@/api/products";
import PrintBarCodes from "@/components/common/custom/PrintBarCodes";
import { ModalAction } from "@/components/common/modals";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import ProductView from "@/components/products/ProductView";
import { COLORS, ICONS, PAGES, PRODUCT_STATES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [isUpdating, Toggle] = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const isDeleted = product?.state === PRODUCT_STATES.DELETED.id;
  const isOOS = product?.state === PRODUCT_STATES.OOS.id;
  const isInactive = product?.state === PRODUCT_STATES.INACTIVE.id;
  const queryClient = useQueryClient();
  const printRef = useRef(null);
  const [activeAction, setActiveAction] = useState(null);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  const actionMap = {
    recover: PRODUCT_STATES.ACTIVE.id,
    softDelete: PRODUCT_STATES.DELETED.id,
    activate: PRODUCT_STATES.ACTIVE.id,
    inactivate: PRODUCT_STATES.INACTIVE.id,
    outOfStock: PRODUCT_STATES.OOS.id,
    inStock: PRODUCT_STATES.ACTIVE.id,
  };

  const handleActionConfirm = async () => {
    setActiveAction(modalAction);
    if (modalAction === "hardDelete") {
      mutateDelete(product, {
        onSettled: () => setActiveAction(null), 
      });
    } else {
      const newState = actionMap[modalAction];
      if (newState) {
        mutate({ ...product, state: newState }, {
          onSettled: () => setActiveAction(null), 
        });
      }
    }
    handleModalClose();
  };

  const openModalWithAction = useCallback((action) => {
    setModalAction(action);
    setIsModalOpen(true);
  }, []);

  const handleRecoverClick = useCallback(() => openModalWithAction("recover"), [openModalWithAction]);
  const handleActivateClick = useCallback(() => openModalWithAction("activate"), [openModalWithAction]);
  const handleInactivateClick = useCallback(() => openModalWithAction("inactivate"), [openModalWithAction]);
  const handleStockChangeClick = useCallback(() => openModalWithAction(isOOS ? "inStock" : "outOfStock"), [isOOS, openModalWithAction]);
  const handleSoftDeleteClick = useCallback(() => openModalWithAction("softDelete"), [openModalWithAction]);
  const handleHardDeleteClick = useCallback(() => openModalWithAction("hardDelete"), [openModalWithAction]);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (product) => {
      const response = await editProduct(product);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Producto actualizado!");
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY], refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_QUERY_KEY, product.code], refetchType: "all" });
        push(PAGES.PRODUCTS.BASE);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const requiresConfirmation = modalAction === "softDelete" || modalAction === "hardDelete";

  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: async () => {
      const response = await deleteProduct(product.code);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Producto eliminado permanentemente!");
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY], refetchType: "all" });
        push(PAGES.PRODUCTS.BASE);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error("Error al eliminar el producto.");
      console.error(error);
    },
  });

  const modalTextMap = useMemo(() => ({
    softDelete: { header: "¿Está seguro que desea eliminar este producto?", confirmText: "eliminar", icon: ICONS.TRASH },
    hardDelete: { header: "¿Está seguro que desea eliminar PERMANENTEMENTE este producto?", confirmText: "eliminar", icon: ICONS.TRASH, bodyContent: "Una vez eliminado de esta forma, el producto no se puede recuperar" },
    recover: { header: "¿Está seguro que desea recuperar el producto?", confirmText: "recuperar", icon: ICONS.UNDO },
    activate: { header: "¿Está seguro que desea activar el producto?", confirmText: "activar", icon: ICONS.PLAY_CIRCLE },
    inactivate: { header: "¿Está seguro que desea desactivar el producto?", confirmText: "desactivar", icon: ICONS.PAUSE_CIRCLE },
    outOfStock: { header: "¿Está seguro que desea cambiar el estado a sin stock?", confirmText: "outOfStock", icon: ICONS.BAN },
    inStock: { header: "¿Está seguro que desea cambiar el estado a en stock?", confirmText: "inStock", icon: ICONS.BOX }
  }), []);

  const { header = "", confirmText = "", icon = ICONS.QUESTION, bodyContent = null } = modalTextMap[modalAction] || {};

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateTitle = useMemo(() => {
    return product?.state ? PRODUCT_STATES[product.state]?.singularTitle || PRODUCT_STATES.INACTIVE.singularTitle : PRODUCT_STATES.INACTIVE.singularTitle;
  }, [product?.state]);

  const stateColor = useMemo(() => {
    return product?.state ? PRODUCT_STATES[product.state]?.color || PRODUCT_STATES.INACTIVE.color : PRODUCT_STATES.INACTIVE.color;
  }, [product?.state]);

  useEffect(() => {
    setLabels([
      PAGES.PRODUCTS.NAME,
      product?.code ? { id: product.code, title: stateTitle, color: stateColor } : null
    ].filter(Boolean));
  }, [setLabels, product, stateTitle, stateColor]);

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
      if (!isDeleted && !isInactive) {
        actions.push({
          id: 2,
          icon: isOOS ? ICONS.BOX : ICONS.BAN,
          color: COLORS.ORANGE,
          onClick: handleStockChangeClick,
          text: isOOS ? "En stock" : PRODUCT_STATES.OOS.singularTitle,
          width: "fit-content",
          loading: activeAction === "outOfStock", 
          disabled: !!activeAction, 
        });
      }
      if (!isDeleted) {
        actions.push({
          id: 3,
          icon: isInactive ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          onClick: isInactive ? handleActivateClick : handleInactivateClick,
          text: isInactive ? "Activar" : "Desactivar",
          width: "fit-content",
          loading: activeAction === "activate" || activeAction === "inactivate", 
          disabled: !!activeAction, 
        });
        actions.push({
          id: 4,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: handleSoftDeleteClick,
          text: "Eliminar",
          loading: activeAction === "softDelete",
          disabled: !!activeAction,
        });
      }
      if (isDeleted) {
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
          loading: activeAction === "hardDelete", 
          disabled: !!activeAction, 
        });
      }
  
      setActions(actions);
    }
  }, [product, isOOS, isInactive, isDeleted, activeAction, handleRecoverClick, handleActivateClick, handleInactivateClick, handleStockChangeClick, handleSoftDeleteClick, handleHardDeleteClick, setActions]);

  return (
    <Loader active={isLoading}>
      <ModalAction
        title={header}
        onConfirm={handleActionConfirm}
        confirmationWord={confirmText}
        placeholder={`Escriba '${confirmText}' para confirmar`}
        confirmButtonText="Confirmar"
        confirmButtonIcon={icon}
        showModal={isModalOpen}
        setShowModal={setIsModalOpen}
        isLoading={isPending || isDeletePending}
        noConfirmation={!requiresConfirmation}
        bodyContent={bodyContent}
      />

      {!isDeleted && Toggle}
      {isUpdating ? (
        <ProductForm product={product} onSubmit={mutate} isUpdating isLoading={isPending} />
      ) : (
        <ProductView product={product} />
      )}
      {product && (
        <OnlyPrint>
          <PrintBarCodes singelProduct ref={printRef} products={[product]} />
        </OnlyPrint>
      )}
    </Loader>
  );
};

export default Product;
