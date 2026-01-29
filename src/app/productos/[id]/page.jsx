"use client";
import { useUserContext } from "@/User";
import { useDeleteProduct, useEditProduct, useGetProduct, useRecoverProduct, useSetProductState } from "@/api/products";
import { useCreateStockFlow, useGetStockFlow } from "@/api/stocks";
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
import { GET_STOCK_FLOW_QUERY_KEY, PRODUCT_STATES, STOCK_TAB_INDEX } from "@/components/products/products.constants";
import { isProductDeleted, isProductInactive, isProductOOS } from "@/components/products/products.utils";
import { useAllowUpdate, useLazyTabs, useProtectedAction, useUnsavedChanges, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Tab } from "semantic-ui-react";

const Product = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: product, isLoading: isLoadingProduct, refetch: isRefetchingProduct } = useGetProduct(params.id);

  const {
    activeIndex,
    onTabChange,
    hasVisited,
  } = useLazyTabs({
    initialIndex: 0,
    lazyIndexes: STOCK_TAB_INDEX !== null ? [STOCK_TAB_INDEX] : [],
  });
  const queryClient = useQueryClient();
  const { data: stockFlows, isLoading: isLoadingsStockFlows, refetch: isRefetchingStockFlows } = useGetStockFlow(params.id, {
    enabled: hasVisited(STOCK_TAB_INDEX),
  });
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState("");
  const printRef = useRef(null);
  const editProduct = useEditProduct();
  const deleteProduct = useDeleteProduct();
  const setProductState = useSetProductState();
  const recoverProduct = useRecoverProduct();
  const createStockFlow = useCreateStockFlow();
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
      { name: PAGES.PRODUCTS.NAME },
      {
        name: product?.id,
        label: {
          title: PRODUCT_STATES[product?.state]?.singularTitle, color: PRODUCT_STATES[product?.state]?.color
        }
      }
    ]);
    isRefetchingProduct();
  }, [setLabels, product, isRefetchingProduct, isRefetchingStockFlows]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  const modalConfig = useMemo(() => ({
    softDelete: {
      header: (
        <>¿Está seguro que desea eliminar el producto <i>{product?.name} ({product?.id}) </i> ?</>
      ),
      confirmText: "eliminar",
      icon: ICONS.TRASH
    },
    hardDelete: {
      header: (
        <>¿Está seguro que desea eliminar PERMANENTEMENTE el producto <i>{product?.name} ({product?.id}) </i> ?</>
      ),
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    recover: {
      header: (
        <>¿Está seguro que desea recuperar el producto <i>{product?.name} ({product?.id}) </i> ?</>
      ),
      icon: ICONS.UNDO
    },
    active: {
      header: (
        <>¿Está seguro que desea activar el producto <i>{product?.name} ({product?.id}) </i> ?</>
      ),
      icon: ICONS.PLAY_CIRCLE
    },
    inactive: {
      header: (
        <>¿Está seguro que desea desactivar el producto <i>{product?.name} ({product?.id}) </i> ?</>
      ),
      icon: ICONS.PAUSE_CIRCLE
    },
    outOfStock: {
      header: (
        <>¿Está seguro que desea cambiar el estado a sin stock el producto <i>{product?.name} ({product?.id}) </i> ?</>
      ),
      icon: ICONS.BAN
    },
    inStock: {
      header: (
        <>¿Está seguro que desea cambiar el estado a en stock el producto <i>{product?.name} ({product?.id}) </i> ?</>
      ),
      icon: ICONS.BOX
    }
  }), [product]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setReason("");
  };

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

  const { mutate: mutateState, isPending: isMutateStatePending } = useMutation({
    mutationFn: setProductState,
    onSuccess: (response, variables) => {
      if (response.statusOk) {
        toast.success(
          variables.state === ACTIVE
            ? 'producto activado!'
            : 'producto desactivado!'
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
    mutationFn: () => deleteProduct(product.id),
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

  const { mutate: mutateCreateStockFlow, isPending: isPendingCreateStockFlow } = useMutation({
    mutationFn: createStockFlow,
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Movimiento de stock registrado");
        queryClient.invalidateQueries({
          queryKey: [GET_STOCK_FLOW_QUERY_KEY, params.id],
          exact: true,
        });
      } else {
        toast.error(response.error?.message || "Error al registrar el movimiento");
      }
    },
    onError: (error) => {
      toast.error(`Error al crear movimiento de stock: ${error.message || error}`);
    },
  });

  const handleActionConfirm = async () => {
    if (modalAction === INACTIVE && !reason) {
      toast.error("Debe proporcionar una razón para desactivar el producto.");
      return;
    }

    setActiveAction(modalAction);
    if (modalAction === "hardDelete") {
      mutateDelete();
    }

    if (modalAction === "softDelete") {
      if (product.state === PRODUCT_STATES.DELETED.id) {
        mutateDelete();
      } else {
        mutateEdit({ id: product.id, state: PRODUCT_STATES.DELETED.id });
      }
    }

    if (modalAction === ACTIVE || modalAction === INACTIVE) {
      mutateState({
        id: product.id,
        state: modalAction,
        ...(modalAction === INACTIVE && { inactiveReason: reason }),
      });
    }

    if (modalAction === "outOfStock") {
      mutateEdit({ id: product.id, state: PRODUCT_STATES.OOS.id });
    }

    if (modalAction === "inStock") {
      mutateEdit({ id: product.id, state: PRODUCT_STATES.ACTIVE.id });
    }

    if (modalAction === RECOVER) {
      mutateRecover();
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === "softDelete" || modalAction === "hardDelete";

  useEffect(() => {
    if (product) {
      const handleClick = (action) => () => handleProtectedAction(() => {
        setModalAction(action);
        setIsModalOpen(true);
      });

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
          onClick: handleClick(isProductOOS(product?.state) ? "inStock" : "outOfStock"),
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
          onClick: handleClick(isProductInactive(product?.state) ? ACTIVE : INACTIVE),
          text: isProductInactive(product?.state) ? "Activar" : "Desactivar",
          width: "fit-content",
          loading: (activeAction === ACTIVE || activeAction === INACTIVE),
          disabled: !!activeAction || isEditPending,
        });
        actions.push({
          id: 4,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: handleClick('softDelete'),
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
          onClick: handleClick('recover'),
          text: "Recuperar",
          width: "fit-content",
          loading: activeAction === "recover",
          disabled: !!activeAction || isEditPending,
        });
        actions.push({
          id: 6,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: handleClick('hardDelete'),
          text: "Eliminar",
          basic: true,
          loading: activeAction === "hardDelete",
          disabled: !!activeAction || isEditPending,
        });
      }

      setActions(actions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, activeAction, isEditPending, setActions]);

  if (!isLoadingProduct && !product) {
    push(PAGES.NOT_FOUND.BASE);
  }

  const panes = [
    {
      menuItem: "Producto",
      render: () => (
        <Tab.Pane>
          <Flex $marginBottom="15px">
            {!isProductDeleted(product?.state) && !isProductInactive(product?.state) && toggleButton}
          </Flex>
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
  ];

  if (product?.stockControl) {
    panes.push({
      menuItem: "Control de stock",
      render: () => (
        <Tab.Pane>
          <ProductStock
            product={product}
            stockFlows={stockFlows}
            onCreateStockFlow={mutateCreateStockFlow}
            isLoading={isPendingCreateStockFlow || isLoadingsStockFlows}
          />
        </Tab.Pane>
      ),
    });
  }

  return (
    <Loader active={isLoadingProduct || !product}>
      <Tab
        panes={panes}
        activeIndex={activeIndex}
        onTabChange={onTabChange}
      />
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
        onConfirm={handleActionConfirm}
        confirmationWord={requiresConfirmation ? confirmText : ""}
        confirmButtonIcon={icon}
        showModal={isModalOpen}
        setShowModal={setIsModalOpen}
        isLoading={isMutateStatePending || isDeletePending || isEditPending || isRecoverPending}
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
