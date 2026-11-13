"use client";
import { useUserContext } from "@/User";
import { useDeleteBySupplierId } from "@/api/products";
import { supplierProductsOptions } from "@/api/productCatalogs";
import { useDeleteSupplier, useEditSupplier, useSetSupplierState } from "@/api/suppliers";
import { FieldsContainer, Flex, FormField, Message, MessageHeader, } from "@/common/components/custom";
import PrintBarCodes from "@/common/components/custom/PrintBarCodes";
import { TextField } from "@/common/components/form";
import { ModalAction } from "@/common/components/modals";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { ACTIVE, COLORS, ENTITIES, ICONS, INACTIVE, PAGES, PLACEHOLDERS, POPUP_POSITIONS } from "@/common/constants";
import { downloadExcel, isItemInactive } from "@/common/utils";
import { formatInteger } from "@/common/utils/numbers";
import { OnlyPrint, useBreadcrumContext, useNavActionsContext, } from "@/components/layout";
import { BatchImportStock } from "@/components/products/BatchImportStock";
import RelatedProducts from "@/components/products/RelatedProducts";
import { DISCOUNT_STOCK, UPLOAD_STOCK } from "@/components/products/products.constants";
import { getProductAssociation } from "@/components/products/products.utils";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { EXAMPLE_TEMPLATE_DATA_STOCK } from "@/components/suppliers/suppliers.constants";
import { useAllowUpdate, useProtectedAction, useUnsavedChanges } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Tab } from "semantic-ui-react";

const SupplierPageClient = ({ supplier, supplierId }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { role } = useUserContext();
  const { push, refresh } = useRouter();
  const queryClient = useQueryClient();
  const [products, setProducts] = useState([]);
  const loadingTool = useRef(false);
  const currentSupplierId = useRef(supplier.id);
  currentSupplierId.current = supplier.id;
  const { canUseProductTools: hasAssociatedProducts, canDeleteEntity } = getProductAssociation(supplier.hasProducts);
  const deletionTooltip = supplier.hasProducts === true
    ? "No se puede eliminar este proveedor, existen productos asociados."
    : !canDeleteEntity ? "No se pudo verificar si el proveedor tiene productos asociados." : undefined;
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
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
  const deleteBySupplierId = useDeleteBySupplierId();
  const setSupplierState = useSetSupplierState();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.SUPPLIERS.NAME }, { name: supplier?.name }]);
  }, [setLabels, supplier]);

  const loadProducts = useCallback(async (action = "stock") => {
    if (!hasAssociatedProducts || loadingTool.current) return null;
    loadingTool.current = true;
    setActiveAction(action);
    try {
      const items = await queryClient.fetchQuery(supplierProductsOptions(supplier.id));
      if (currentSupplierId.current !== supplier.id) return null;
      setProducts(items);
      return items;
    } catch (error) {
      toast.error(error.message || "No se pudieron cargar los productos del proveedor.");
      return null;
    } finally {
      loadingTool.current = false;
      if (currentSupplierId.current === supplier.id) setActiveAction(null);
    }
  }, [hasAssociatedProducts, queryClient, supplier.id]);

  const [printPending, setPrintPending] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  useEffect(() => {
    if (!printPending) return;
    handlePrint();
    setPrintPending(false);
  }, [printPending, handlePrint]);

  const modalConfig = {
    deleteSupplier: {
      header: (
        <>¿Está seguro que desea eliminar PERMANENTEMENTE al proveedor <i>{supplier?.name} ({supplier?.id}) </i> ?</>
      ),
      confirmText: "eliminar",
      icon: ICONS.TRASH,
      tooltip: deletionTooltip,
    },
    deleteBatch: {
      header: (
        <>¿Está seguro que desea eliminar los {formatInteger(products?.length || "")} productos del proveedor <i>{supplier?.name} ({supplier?.id}) </i> ?</>
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
          setProducts([]);
          refresh();
          handleModalClose();
        } else {
          toast.error(`${response?.message} (${response?.error?.message})`);
        }
      },
      onSettled: () => {
        setActiveAction(null);
        handleModalClose();
      },
    });

  const { mutate: mutateDelete, isPending: isDeletePending } =
    useMutation({
      mutationFn: () => deleteSupplier(supplier.id),
      onSuccess: (response) => {
        if (response.statusOk) {
          toast.success('Proveedor eliminado permanentemente!');
          push(PAGES.SUPPLIERS.BASE);
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
    if (confirmationAction === INACTIVE && !reason) {
      toast.error("Debe proporcionar una razón para desactivar el proveedor.");
      return;
    }

    if (confirmationAction === "deleteSupplier" && !canDeleteEntity) return;
    if (confirmationAction === "deleteBatch" && !hasAssociatedProducts) return;
    setActiveAction(confirmationAction);

    if (confirmationAction === "deleteBatch") {
      mutateDeleteBatch();
    }

    if (confirmationAction === "deleteSupplier") {
      mutateDelete();
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
    if (activeIndex !== 0) return;

    const handleBarCodePrint = async () => {
      const items = await loadProducts("print");
      if (items) setPrintPending(true);
    };

    let actions = [];

    if (RULES.canRemove[role]) {
      const handleClick = (action) => () =>
        handleProtectedAction(() => {
          setConfirmationAction(action);
        });
      const busy = !!activeAction || isEditPending || printPending;
      const productToolsDisabled = busy || !hasAssociatedProducts;
      const stockExcelTooltip = !hasAssociatedProducts
        ? "No hay productos disponibles o no se pudo verificar la asociación."
        : false;

      actions = [{
        id: 1,
        icon: ICONS.BARCODE,
        color: COLORS.BLUE,
        text: "Imprimir códigos de productos",
        onClick: productToolsDisabled ? undefined : handleBarCodePrint,
        loading: activeAction === "print",
        disabled: productToolsDisabled,
        tooltip: !hasAssociatedProducts
          ? 'No existen productos de este proveedor.'
          : false,
        collapsedTooltip: !hasAssociatedProducts
          ? 'No existen productos de este proveedor.'
          : undefined,
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
        collapsedTooltip: stockExcelTooltip || "Acciones de stock y Excel del proveedor",
        disabled: busy,

        items: [
          {
            id: "upload-stock",
            disabled: productToolsDisabled,
            tooltip: stockExcelTooltip,
            text: "Cargar stock del proveedor",
            color: COLORS.GREEN,
            button: (
              <BatchImportStock
                mode={UPLOAD_STOCK}
                supplierId={supplier?.id}
                products={products}
                disabled={productToolsDisabled}
                loadProducts={hasAssociatedProducts ? loadProducts : undefined}
              />
            ),
          },
          {
            id: "discount-stock",
            disabled: productToolsDisabled,
            tooltip: stockExcelTooltip,
            text: "Descontar stock del proveedor",
            color: COLORS.RED,
            button: (
              <BatchImportStock
                mode={DISCOUNT_STOCK}
                supplierId={supplier?.id}
                products={products}
                disabled={productToolsDisabled}
                loadProducts={hasAssociatedProducts ? loadProducts : undefined}
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
        onClick: productToolsDisabled ? undefined : () => handleProtectedAction(async () => {
          const items = await loadProducts("deleteBatch");
          if (items) setConfirmationAction("deleteBatch");
        }),
        loading: activeAction === "deleteBatch",
        disabled: productToolsDisabled,
        tooltip: !hasAssociatedProducts
          ? 'No existen productos de este proveedor.'
          : false,
        collapsedTooltip: !hasAssociatedProducts
          ? 'No existen productos de este proveedor.'
          : undefined,
        iconOnly: true
      },
      {
        id: 5,
        icon: ICONS.TRASH,
        color: COLORS.RED,
        text: "Eliminar proveedor",
        onClick: canDeleteEntity && !busy ? handleClick('deleteSupplier') : undefined,
        loading: activeAction === "deleteSupplier",
        disabled: !canDeleteEntity || busy,
        tooltip: deletionTooltip,
        collapsedTooltip: deletionTooltip,
        iconOnly: true,
        basic: true,
        popupPosition: POPUP_POSITIONS.BOTTOM_RIGHT
      }];
    }

    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, role, supplier, products, hasAssociatedProducts, activeAction, isEditPending, loadProducts, canDeleteEntity, printPending, deletionTooltip]);

  const details = (
    <Tab.Pane>
      <Flex $flexDirection="column" $rowGap="15px">
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
          view
          isDeletePending={isDeletePending}
        />
      </Flex>
    </Tab.Pane>
  );
  const panes = [
    { menuItem: "Proveedor", render: () => details },
    {
      menuItem: "Productos",
      render: () => (
        <Tab.Pane>
          <RelatedProducts key={supplierId} entity={ENTITIES.SUPPLIER} id={supplierId} name={supplier.name} />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <>
      <Tab
        panes={panes}
        activeIndex={activeIndex}
        onTabChange={(_, { activeIndex: nextIndex }) => {
          if (nextIndex !== activeIndex) handleProtectedAction(() => setActiveIndex(nextIndex));
        }}
      />
      {!isUpdating && (
        <OnlyPrint>
          <PrintBarCodes ref={printRef} products={products} />
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
          isDeletePending ||
          isMutateStatePending
        }
        noConfirmation={!requiresConfirmation}
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
    </>
  );
};

export default SupplierPageClient;
