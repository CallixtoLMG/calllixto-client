"use client";
import { useUserContext } from "@/User";
import { LIST_PRODUCTS_QUERY_KEY, deleteProduct, editProduct, useGetProduct } from "@/api/products";
import PrintBarCodes from "@/components/common/custom/PrintBarCodes";
import { ModalAction } from "@/components/common/modals";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES, PRODUCT_STATES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import ProductView from "../../../components/products/ProductView";

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

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  const handleActionConfirm = async () => {
    if (modalAction === "hardDelete") {
      mutateHardDelete(product);
    } else {
      let newState;
      switch (modalAction) {
        case "recover":
          newState = PRODUCT_STATES.ACTIVE.id;
          break;
        case "softDelete":
          newState = PRODUCT_STATES.DELETED.id;
          break;
        case "activate":
          newState = PRODUCT_STATES.ACTIVE.id;
          break;
        case "inactivate":
          newState = PRODUCT_STATES.INACTIVE.id;
          break;
        case "sinstock":
          newState = PRODUCT_STATES.OOS.id;
          break;
        case "enstock":
          newState = PRODUCT_STATES.ACTIVE.id;
          break;
        default:
          break;
      }
      mutate({ ...product, state: newState });
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
  const handleStockChangeClick = useCallback(() => openModalWithAction(isOOS ? "enstock" : "sinstock"), [isOOS, openModalWithAction]);
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
  

  const { mutate: mutateHardDelete, isPending: isHardDeletePending } = useMutation({
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
    softDelete: { header: "¿Está seguro que desea eliminar este producto?", confirmText: "eliminar", icon: "trash" },
    hardDelete: { header: "¿Está seguro que desea eliminar PERMANENTEMENTE este producto?", confirmText: "eliminar", icon: "trash" },
    recover: { header: "¿Está seguro que desea recuperar el producto?", confirmText: "recuperar", icon: "undo" },
    activate: { header: "¿Está seguro que desea activar el producto?", confirmText: "activar", icon: "play circle" },
    inactivate: { header: "¿Está seguro que desea desactivar el producto?", confirmText: "desactivar", icon: "pause circle" },
    sinstock: { header: "¿Está seguro que desea cambiar el estado a sin stock?", confirmText: "sinstock", icon: "ban" },
    enstock: { header: "¿Está seguro que desea cambiar el estado a en stock?", confirmText: "enstock", icon: "box" }
  }), []);

  const { header = "", confirmText = "", icon = "question" } = modalTextMap[modalAction] || {};

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
  }, [setLabels, product]);

  useEffect(() => {
    if (product) {
      const actions = [
        {
          id: 1,
          icon: "barcode",
          color: "blue",
          onClick: () => setTimeout(handlePrint),
          text: "Código",
          loading: isPending || isHardDeletePending,
        },
      ];

      if (!isDeleted && !isInactive) {
        actions.push({
          id: 2,
          icon: isOOS ? "box" : "ban",
          color: "orange",
          onClick: handleStockChangeClick,
          text: isOOS ? "En stock" : "Sin stock",
          disabled: isInactive || isDeleted,
          loading: isPending || isHardDeletePending,
          width: "fit-content"
        });
      }

      if (!isDeleted) {
        actions.push({
          id: 3,
          icon: isInactive ? "play circle" : "pause circle",
          color: "grey",
          onClick: isInactive ? handleActivateClick : handleInactivateClick,
          text: isInactive ? "Activar" : "Desactivar",
          disabled: isDeleted,
          loading: isPending || isHardDeletePending,
          width: "fit-content"
        });

        actions.push({
          id: 4,
          icon: "trash",
          color: "red",
          onClick: handleSoftDeleteClick,
          text: "Eliminar",
          loading: isPending || isHardDeletePending,
        });
      }

      if (isDeleted) {
        actions.push({
          id: 5,
          icon: "undo",
          color: "green",
          onClick: handleRecoverClick,
          text: "Recuperar",
          disabled: !isDeleted,
          loading: isPending || isHardDeletePending,
        });

        actions.push({
          id: 6,
          icon: "trash",
          color: "red",
          onClick: handleHardDeleteClick,
          text: "Eliminar",
          loading: isPending || isHardDeletePending,
        });
      }

      setActions(actions);
    }
  }, [product, isOOS, isInactive, isDeleted, handleRecoverClick, handleActivateClick, handleInactivateClick, handleStockChangeClick, handleSoftDeleteClick, handleHardDeleteClick, isPending, isHardDeletePending]);

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
        isLoading={isPending || isHardDeletePending}
        noConfirmation={!requiresConfirmation}
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
