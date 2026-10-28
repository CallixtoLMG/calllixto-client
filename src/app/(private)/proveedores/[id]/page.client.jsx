"use client";
import { useUserContext } from "@/User";
import { useDeleteBySupplierId, useProductsBySupplierId } from "@/api/products";
import { useDeleteSupplier, useEditSupplier, useSetSupplierState } from "@/api/suppliers";
import { FieldsContainer, FormField, Message, MessageHeader, } from "@/common/components/custom";
import PrintBarCodes from "@/common/components/custom/PrintBarCodes";
import { TextField } from "@/common/components/form";
import { ModalAction } from "@/common/components/modals";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { ACTIVE, COLORS, ICONS, INACTIVE, PAGES, PLACEHOLDERS, POPUP_POSITIONS } from "@/common/constants";
import { downloadExcel, isItemInactive } from "@/common/utils";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext, } from "@/components/layout";
import { BatchImportStock } from "@/components/products/BatchImportStock";
import { DISCOUNT_STOCK, PRODUCT_STATES, UPLOAD_STOCK } from "@/components/products/products.constants";
import { getFormatedMargin } from "@/components/products/products.utils";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { EXAMPLE_TEMPLATE_DATA_STOCK } from "@/components/suppliers/suppliers.constants";
import { useAllowUpdate, useProtectedAction, useUnsavedChanges } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

const SupplierPageClient = ({ supplier }) => {
  const { role } = useUserContext();
  const { push, refresh } = useRouter();
  const { loadProducts, invalidateProducts } = useProductsBySupplierId(supplier.id, { enabled: false });
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const toolBusy = useRef(false);
  const [batchProductCount, setBatchProductCount] = useState(0);
  const [printProducts, setPrintProducts] = useState([]);
  const pendingPrintProducts = useRef([]);
  const printReady = useRef(null);
  const hasProducts = supplier?.hasProducts === true;
  const runProductsTool = useCallback(async (name, action) => {
    if (!hasProducts || toolBusy.current) return;
    toolBusy.current = true;
    setActiveAction(name);
    try {
      const items = await loadProducts();
      if (!items.length) { toast("No hay productos de este proveedor."); return; }
      return await action(items);
    } catch (error) {
      toast.error(error.message || "No se pudieron cargar los productos del proveedor");
    } finally {
      toolBusy.current = false;
      setActiveAction(null);
    }
  }, [hasProducts, loadProducts]);
  const [reason, setReason] = useState("");
  const printRef = useRef(null);
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
  const { handleProtectedAction } = useProtectedAction({ formRef, onBeforeView });
  const editSupplier = useEditSupplier();
  const deleteSupplier = useDeleteSupplier();
  const canDeleteSupplier = supplier?.hasProducts === false;
  const productsInfoMissing = typeof supplier?.hasProducts !== "boolean";
  const deleteBlockedMessage = supplier?.hasProducts === true
    ? "No se puede eliminar este proveedor, existen productos asociados."
    : "Información de productos asociados no disponible. No se puede eliminar este proveedor hasta recibir esa información.";
  const deleteBySupplierId = useDeleteBySupplierId();
  const setSupplierState = useSetSupplierState();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.SUPPLIERS.NAME }, { name: supplier?.name }]);
  }, [setLabels, supplier]);

  useEffect(() => {
    printReady.current?.();
    printReady.current = null;
  }, [printProducts]);

  const printOptions = useMemo(() => ({
    onBeforeGetContent: () => new Promise(resolve => {
      printReady.current = resolve;
      setPrintProducts([...pendingPrintProducts.current]);
    }),
    content: () => printRef.current,
    removeAfterPrint: true,
  }), []);
  const handlePrint = useReactToPrint(printOptions);

  const modalConfig = {
    deleteSupplier: {
      header: (
        <>¿Está seguro que desea eliminar PERMANENTEMENTE al proveedor <i>{supplier?.name} ({supplier?.id}) </i> ?</>
      ),
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    deleteBatch: {
      header: (
        <>¿Está seguro que desea eliminar los {batchProductCount} productos del proveedor <i>{supplier?.name} ({supplier?.id}) </i> ?</>
      ),
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    active: {
      header: (
        <>¿Está seguro que desea activar el proveedor <i>{supplier?.name} ({supplier?.id}) </i> ?</>
      ),
      icon: ICONS.PLAY_CIRCLE,
    },
    inactive: {
      header: (
        <>¿Está seguro que desea desactivar el proveedor <i>{supplier?.name} ({supplier?.id}) </i> ?</>
      ),
      icon: ICONS.PAUSE_CIRCLE,
    },
  };

  const handleModalClose = () => {
    setConfirmationAction(null);
    setReason("");
  };

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: editSupplier,
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Proveedor actualizado!');
        setIsUpdating(false);
        refresh();
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

  const { mutate: mutateDeleteBatch, isPending: isDeleteBatchPending } =
    useMutation({
      mutationFn: () => deleteBySupplierId(supplier.id),
      onSuccess: (response) => {
        if (response.statusOk) {
          toast.success('Lista de productos del proveedor eliminada!');
          handleModalClose();
          invalidateProducts();
          refresh();
        } else {
          toast.error(`${response?.message} (${response?.error?.message})`);
        }
      },
      onSettled: () => {
        setActiveAction(null);
        handleModalClose();
      },
    });

  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: () => deleteSupplier(supplier.id),
    onSuccess: response => {
      if (response.statusOk) {
        toast.success("Proveedor eliminado permanentemente!");
        push(PAGES.SUPPLIERS.BASE);
      } else toast.error(response?.message || response?.error?.message || "No se pudo eliminar el proveedor");
    },
    onError: error => toast.error(error?.response?.data?.message || error.message || "No se pudo eliminar el proveedor"),
    onSettled: () => { setActiveAction(null); handleModalClose(); },
  });

  const { mutate: mutateState, isPending: isMutateStatePending } = useMutation({
    mutationFn: setSupplierState,
    onSuccess: (response, variables) => {
      if (response.statusOk) {
        toast.success(
          variables.state === ACTIVE
            ? 'Proveedor activado!'
            : 'Proveedor desactivado!'
        );
        refresh();
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
    if (confirmationAction === "deleteSupplier") {
      if (!canDeleteSupplier || isDeletePending) return;
      setActiveAction("deleteSupplier");
      mutateDelete();
      return;
    }
    if (confirmationAction === INACTIVE && !reason) {
      toast.error("Debe proporcionar una razón para desactivar el proveedor.");
      return;
    }

    setActiveAction(confirmationAction);

    if (confirmationAction === "deleteBatch") {
      mutateDeleteBatch();
    }

    if (confirmationAction === ACTIVE || confirmationAction === INACTIVE) {
      mutateState({
        id: supplier.id,
        state: confirmationAction,
        ...(confirmationAction === INACTIVE && { inactiveReason: reason }),
      });
    }

    handleModalClose();
  };

  const { header, confirmText = '', icon = ICONS.QUESTION } =
    modalConfig[confirmationAction] || {};

  const requiresConfirmation =
    confirmationAction === "deleteSupplier" ||
    confirmationAction === "deleteBatch";

  useEffect(() => {
    const handleBarCodePrint = () => runProductsTool("print", items => {
      pendingPrintProducts.current = items;
      handlePrint();
    });
    const handleDownloadExcel = () => runProductsTool("excel", items => {
      const headers = [
        'Id',
        'Nombre',
        'Marca',
        'Proveedor',
        'Costo',
        'Precio',
        'Margen',
        'Estado',
        'Comentarios',
      ];

      const mappedProducts = items.map((product) => {
        const productState = PRODUCT_STATES[product.state]?.singularTitle || product.state;
        return [
          product.id,
          product.name,
          product.brandName,
          product.supplierName,
          product.cost,
          product.price,
          getFormatedMargin(product.price, product.cost),
          productState,
          product.comments,
        ];
      });
      downloadExcel(
        [headers, ...mappedProducts],
        `Lista de productos de ${supplier.name}`,
      );
    });

    let actions = [];

    if (RULES.canRemove[role]) {
      const handleClick = (action) => () =>
        handleProtectedAction(() => {
          if (action === "deleteSupplier" && !canDeleteSupplier) return;
          setConfirmationAction(action);
        });
      const busy = !!activeAction || isEditPending;
      const productsDisabled = !hasProducts || busy;
      const handleDeleteBatch = () => {
        if (productsDisabled) return;
        return handleProtectedAction(() => runProductsTool("prepareDeleteBatch", items => {
          setBatchProductCount(items.length);
          setConfirmationAction("deleteBatch");
        }));
      };

      actions = [{
        id: 1,
        icon: ICONS.BARCODE,
        color: COLORS.BLUE,
        text: "Imprimir códigos de productos",
        onClick: handleBarCodePrint,
        loading: activeAction === "print",
        disabled: productsDisabled,
        iconOnly: true
      },
      {
        id: 2,
        icon: isItemInactive(supplier?.state)
          ? ICONS.PLAY_CIRCLE
          : ICONS.PAUSE_CIRCLE,
        color: COLORS.BLUE,
        text: isItemInactive(supplier?.state) ? "Activar proveedor" : "Desactivar proveedor",
        onClick: handleClick(isItemInactive(supplier?.state) ? ACTIVE : INACTIVE),
        loading: activeAction === ACTIVE || activeAction === INACTIVE,
        disabled: !!activeAction || isEditPending,
        iconOnly: true
      },
      {
        id: 3,
        icon: ICONS.FILE_EXCEL,
        color: COLORS.BLUE,
        text: "Stock/Excel",
        collapsedTooltip: "Acciones de stock y Excel del proveedor",
        disabled: busy,
        loading: activeAction === "excel" || activeAction === UPLOAD_STOCK || activeAction === DISCOUNT_STOCK,
        items: [
          {
            id: "download-products",
            icon: ICONS.DOWNLOAD,
            color: COLORS.BLUE,
            text: "Descargar productos del proveedor",
            onClick: handleDownloadExcel,
            loading: activeAction === "excel",
            disabled: productsDisabled,
          },
          {
            id: "upload-stock",
            text: "Cargar stock del proveedor",
            color: COLORS.GREEN,
            disabled: productsDisabled,
            button: (
              <BatchImportStock
                mode={UPLOAD_STOCK}
                supplierId={supplier?.id}
                disabled={productsDisabled}
                loadProducts={() => runProductsTool(UPLOAD_STOCK, items => items)}
                onProductsChanged={invalidateProducts}
              />
            ),
          },
          {
            id: "discount-stock",
            text: "Descontar stock del proveedor",
            color: COLORS.RED,
            disabled: productsDisabled,
            button: (
              <BatchImportStock
                mode={DISCOUNT_STOCK}
                supplierId={supplier?.id}
                disabled={productsDisabled}
                loadProducts={() => runProductsTool(DISCOUNT_STOCK, items => items)}
                onProductsChanged={invalidateProducts}
              />
            ),
          },
          {
            id: "stock-template",
            icon: ICONS.FILE_EXCEL_OUTLINE,
            color: COLORS.BLUE,
            text: "Descargar plantilla de stock",
            onClick: () => downloadExcel(EXAMPLE_TEMPLATE_DATA_STOCK, "Ejemplo de tabla stock"),
          },
        ],
      },
      {
        id: 4,
        icon: ICONS.LIST_UL,
        color: COLORS.RED,
        text: "Eliminar todos los productos del proveedor",
        onClick: handleDeleteBatch,
        loading: activeAction === "deleteBatch" || activeAction === "prepareDeleteBatch",
        disabled: productsDisabled,
        iconOnly: true
      },
      {
        id: 5,
        icon: ICONS.TRASH,
        color: COLORS.RED,
        text: "Eliminar proveedor",
        onClick: handleClick('deleteSupplier'),
        loading: activeAction === "deleteSupplier",
        disabled: !canDeleteSupplier || !!activeAction || isEditPending,
        tooltip: !canDeleteSupplier ? deleteBlockedMessage : false,
        collapsedTooltip: !canDeleteSupplier ? deleteBlockedMessage : undefined,
        iconOnly: true,
        basic: true,
        popupPosition: POPUP_POSITIONS.BOTTOM_RIGHT
      }];
    }

    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, supplier, activeAction, isEditPending, hasProducts, canDeleteSupplier, deleteBlockedMessage, runProductsTool, invalidateProducts, handlePrint]);

  return (
    <Loader>
      {productsInfoMissing && RULES.canRemove[role] && (
        <Message warning>
          <MessageHeader>Información de productos asociados no disponible</MessageHeader>
          <p>No se puede eliminar este proveedor hasta recibir esa información.</p>
        </Message>
      )}
      {!isItemInactive(supplier?.state) && toggleButton}
      {isItemInactive(supplier?.state) && (
        <FieldsContainer>
          <FormField flex="1">
            <Message negative>
              <MessageHeader>Motivo de inactivación</MessageHeader>
              <p>{supplier.inactiveReason}</p>
            </Message>
          </FormField>
          <FormField flex="1" />
          <FormField flex="1" />
        </FieldsContainer>
      )}
      <SupplierForm
        ref={formRef}
        supplier={supplier}
        onSubmit={mutateEdit}
        isLoading={isEditPending}
        isUpdating={isUpdating && !isItemInactive(supplier?.state)}
        isDeletePending={isDeletePending}
        view
      />
      {!isUpdating && (
        <OnlyPrint>
          <PrintBarCodes ref={printRef} products={printProducts} />
        </OnlyPrint>
      )}
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
        showModal={!!confirmationAction}
        setShowModal={handleModalClose}
        isLoading={
          isDeleteBatchPending ||
          isMutateStatePending || isDeletePending
        }
        noConfirmation={!requiresConfirmation}
        disableButtons={confirmationAction === "deleteSupplier" && !canDeleteSupplier}
        bodyContent={
          confirmationAction === INACTIVE && (
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

export default SupplierPageClient;
