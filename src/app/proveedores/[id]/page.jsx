"use client";
import { useUserContext } from "@/User";
import { useBatchDeleteProducts, useDeleteBySupplierId, useDeleteProduct, useEditProduct, useProductsBySupplierId } from "@/api/products";
import {
  useActiveSupplier,
  useDeleteSupplier,
  useEditSupplier,
  useGetSupplier,
  useInactiveSupplier,
} from "@/api/suppliers";
import { IconedButton } from "@/common/components/buttons";
import {
  Flex,
  Icon,
  Message,
  MessageHeader,
} from "@/common/components/custom";
import PrintBarCodes from "@/common/components/custom/PrintBarCodes";
import { DropdownControlled, TextControlled, TextField } from "@/common/components/form";
import { ModalAction, ModalMultiDelete } from "@/common/components/modals";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { Filters, Table } from "@/common/components/table";
import { ACTIVE, COLORS, ENTITIES, ICONS, INACTIVE, PAGES } from "@/common/constants";
import { createFilter, downloadExcel, isItemInactive } from "@/common/utils";
import {
  Loader,
  OnlyPrint,
  useBreadcrumContext,
  useNavActionsContext,
} from "@/components/layout";
import { EMPTY_FILTERS, PRODUCT_COLUMNS, PRODUCT_STATES, PRODUCT_STATES_OPTIONS } from "@/components/products/products.constants";
import { getFormatedMargin } from "@/components/products/products.utils";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useFilters } from "@/hooks/useFilters";
import { useProtectedAction } from "@/hooks/useProtectedAction";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Form, Tab } from "semantic-ui-react";
import { useUnsavedChanges } from "../../../hooks/unsavedChanges";

const Supplier = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: supplier, isLoading, refetch: refetchSupplier } = useGetSupplier(params.id);
  const { data: products, isLoading: loadingProducts, refetch: refetchProducts } =
    useProductsBySupplierId(params.id);
  console.log(products)
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [reason, setReason] = useState("");
  const printRef = useRef(null);
  const formRef = useRef(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const {
    onRestoreFilters,
    onSubmit,
    appliedFilters,
    methods
  } = useFilters(EMPTY_FILTERS);
  const onFilter = createFilter(appliedFilters, ['code', 'name']);
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
  const editSupplier = useEditSupplier();
  const deleteSupplier = useDeleteSupplier();
  const deleteBySupplierId = useDeleteBySupplierId();
  const inactiveSupplier = useInactiveSupplier();
  const activeSupplier = useActiveSupplier();
  const batchDeleteProducts = useBatchDeleteProducts();
  const deleteProduct = useDeleteProduct();
  const editProduct = useEditProduct();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.SUPPLIERS.NAME, supplier?.name]);
    refetchSupplier();
    refetchProducts();
  }, [setLabels, supplier, refetchProducts, refetchSupplier]);

  const hasAssociatedProducts = useMemo(() => !!products?.length, [products]);

  const handleDownloadExcel = useCallback(() => {
    if (!products) return;
    const headers = [
      'Código',
      'Nombre',
      'Marca',
      'Proveedor',
      'Cost ',
      'Precio',
      'Margen',
      'Estado',
      'Comentarios',
    ];

    const mappedProducts = products.map((product) => {
      const productState = PRODUCT_STATES[product.state]?.singularTitle || product.state;
      return [
        product.code,
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
  }, [products, supplier]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  const tableActions = RULES.canRemove[role] ? [
    {
      id: 1,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (product) => {
        setSelectedProduct(product);
        setShowModalDelete(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const modalConfig = {
    deleteSupplier: {
      header: `¿Está seguro que desea eliminar PERMANENTEMENTE al proveedor "${supplier?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
      tooltip: hasAssociatedProducts
        ? 'No se puede eliminar este proveedor, existen productos asociados.'
        : false,
    },
    deleteBatch: {
      header: `¿Está seguro que desea eliminar los ${products?.length || ""} productos del proveedor "${supplier?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
    },
    active: {
      header: `¿Está seguro que desea activar el proveedor "${supplier?.name}"?`,
      icon: ICONS.PLAY_CIRCLE,
    },
    inactive: {
      header: `¿Está seguro que desea desactivar el proveedor "${supplier?.name}"?`,
      icon: ICONS.PAUSE_CIRCLE,
    },
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setReason("");
  };

  const handleOpenModalWithAction = useCallback((action) => {
    setModalAction(action);
    setIsModalOpen(true);
  }, []);

  const handleActivateClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction(ACTIVE)),
    [handleProtectedAction, handleOpenModalWithAction],
  );

  const handleInactivateClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction(INACTIVE)),
    [handleProtectedAction, handleOpenModalWithAction],
  );

  const handleDeleteClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction('deleteSupplier')),
    [handleProtectedAction, handleOpenModalWithAction],
  );

  const handleDeleteBatchClick = useCallback(
    () => handleProtectedAction(() => handleOpenModalWithAction('deleteBatch')),
    [handleProtectedAction, handleOpenModalWithAction],
  );

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: editSupplier,
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Proveedor actualizado!');
        setIsUpdating(false);
        resolveSave();
      } else {
        toast.error(response.error.message);
      }
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
      closeModal();
    },
  });

  const { mutate: mutateActive, isPending: isActivePending } = useMutation({
    mutationFn: ({ supplier }) => activeSupplier(supplier),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Proveedor activado!");
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
    mutationFn: ({ supplier, reason }) => inactiveSupplier(supplier, reason),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Proveedor desactivado!");
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
    onSettled: () => {
      setActiveAction(null);
      handleModalClose();
    },
  });

  const { mutate: mutateDeleteBatch, isPending: isDeleteBatchPending } =
    useMutation({
      mutationFn: () => deleteBySupplierId(params.id),
      onSuccess: (response) => {
        if (response.statusOk) {
          toast.success('Lista de productos del proveedor eliminada!');
          handleModalClose();
        } else {
          toast.error(response.error.message);
        }
      },
      onSettled: () => {
        setActiveAction(null);
        handleModalClose();
      },
    });

  const { mutate: mutateDeleteSupplier, isPending: isDeletePending } =
    useMutation({
      mutationFn: () => deleteSupplier(params.id),
      onSuccess: (response) => {
        if (response.statusOk) {
          toast.success('Proveedor eliminado permanentemente!');
          push(PAGES.SUPPLIERS.BASE);
        } else {
          toast.error(response.error.message);
        }
      },
      onSettled: () => {
        setActiveAction(null);
        handleModalClose();
      },
    });

  const onSelectionChange = useCallback(selected => {
    const isSelected = !!selectedProducts[selected.code];
    if (isSelected) {
      const newProducts = { ...selectedProducts };
      delete newProducts[selected.code];
      setSelectedProducts(newProducts);
    } else {
      setSelectedProducts(prev => ({ ...prev, [selected.code]: selected }));
    }
  }, [selectedProducts]);

  const selectionActions = useMemo(() => {
    const actions = [
      <IconedButton
        key={2}
        text="Descargar Códigos"
        icon={ICONS.BARCODE}
        onClick={handlePrint}
      />
    ];

    if (RULES.canRemove[role]) {
      actions.unshift(
        <IconedButton
          key={1}
          text="Eliminar Productos"
          icon={ICONS.TRASH}
          color={COLORS.RED}
          onClick={() => setShowConfirmDeleteModal(true)}
        />
      );
    }

    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const selectAllCurrentPageElements = (currentPageElements) => {
    const newSelectedProducts = {};
    currentPageElements.forEach(product => {
      newSelectedProducts[product.code] = product;
    });
    setSelectedProducts(newSelectedProducts);
  };

  const handleActionConfirm = async () => {
    setActiveAction(modalAction);

    if (modalAction === "deleteBatch") {
      mutateDeleteBatch();
    }

    if (modalAction === "deleteSupplier") {
      mutateDeleteSupplier();
    }

    if (modalAction === INACTIVE) {
      if (!reason) {
        toast.error(
          'Debe proporcionar una razón para desactivar al proveedor.',
        );
        return;
      }
      mutateInactive({ supplier, reason });
    }

    if (modalAction === ACTIVE) {
      mutateActive({ supplier });
    }

    handleModalClose();
  };

  const { mutate: mutateDeleteProduct, isPending } = useMutation({
    mutationFn: async () => {
      let response;
      if (selectedProduct.state === PRODUCT_STATES.DELETED.id) {
        response = await deleteProduct(selectedProduct?.code);
      } else {
        response = await editProduct({ ...selectedProduct, state: PRODUCT_STATES.DELETED.id });
      }
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Producto eliminado!');
        setShowModalDelete(false);
      } else {
        toast.error(response.error.message);
      }
    },
  });

  const {
    header,
    confirmText = '',
    icon = ICONS.QUESTION,
  } = modalConfig[modalAction] || {};
  const requiresConfirmation =
    modalAction === "deleteSupplier" || modalAction === "deleteBatch";

  useEffect(() => {
    const handleBarCodePrint = () => {
      if (hasAssociatedProducts) {
        setActiveAction("print");
        handlePrint();
        setActiveAction(null);
      } else {
        toast("No hay productos de este proveedor.", {
          icon: (
            <Icon
              margin="0"
              toast
              name={ICONS.INFO_CIRCLE}
              color={COLORS.BLUE}
            />
          ),
        });
      }
    };

    const actions = RULES.canRemove[role]
      ? [
        {
          id: 1,
          icon: ICONS.BARCODE,
          color: COLORS.BLUE,
          text: "Códigos",
          onClick: handleBarCodePrint,
          loading: activeAction === "print",
          disabled: !!activeAction || isEditPending || !hasAssociatedProducts,
          tooltip: !hasAssociatedProducts
            ? 'No existen productos de este proveedor.'
            : false,
        },
        {
          id: 2,
          icon: isItemInactive(supplier?.state)
            ? ICONS.PLAY_CIRCLE
            : ICONS.PAUSE_CIRCLE,
          color: COLORS.GREY,
          text: isItemInactive(supplier?.state) ? "Activar" : "Desactivar",
          onClick: isItemInactive(supplier?.state)
            ? handleActivateClick
            : handleInactivateClick,
          loading: activeAction === 'active' || activeAction === 'inactive',
          disabled: !!activeAction || isEditPending,
          width: "fit-content",
        },
        {
          id: 3,
          icon: ICONS.FILE_EXCEL,
          text: "Descargar productos",
          onClick: () => {
            if (products?.length) {
              setIsExcelLoading(true);
              handleDownloadExcel();
              setIsExcelLoading(false);
            } else {
              toast("No hay productos de este proveedor para descargar.", {
                icon: (
                  <Icon
                    margin="0"
                    toast
                    name={ICONS.INFO_CIRCLE}
                    color={COLORS.BLUE}
                  />
                ),
              });
            }
          },
          loading: isExcelLoading,
          disabled:
            isExcelLoading ||
            !!activeAction ||
            loadingProducts ||
            isEditPending ||
            !hasAssociatedProducts,
          tooltip: !hasAssociatedProducts
            ? 'No existen productos de este proveedor.'
            : false,
          width: "fit-content",
        },
        {
          id: 4,
          icon: ICONS.LIST_UL,
          color: COLORS.RED,
          text: "Eliminar productos",
          onClick: handleDeleteBatchClick,
          loading: activeAction === "deleteBatch",
          disabled: !hasAssociatedProducts || !!activeAction || isEditPending,
          tooltip: !hasAssociatedProducts
            ? 'No existen productos de este proveedor.'
            : false,
          width: "fit-content",
        },
        {
          id: 5,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          text: "Eliminar",
          onClick: handleDeleteClick,
          loading: activeAction === "deleteSupplier",
          disabled: hasAssociatedProducts || !!activeAction || isEditPending,
          tooltip: hasAssociatedProducts
            ? 'No se puede eliminar este proveedor, existen productos asociados.'
            : false,
          width: "fit-content",
          basic: true,
        },
      ]
      : [];

    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    role,
    activeAction,
    hasAssociatedProducts,
    isActivePending,
    isExcelLoading,
    isEditPending,
    handleDeleteBatchClick,
    loadingProducts,
    supplier?.name,
    handleDeleteClick,
    handleActivateClick,
    handleInactivateClick,
    products,
    supplier?.state,
    setActions,
  ]);

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
  }

  const { mutate: deleteSelectedProducts, isPending: deleteIsPending } = useMutation({
    mutationFn: async () => {
      const codes = Object.keys(selectedProducts);
      const response = await batchDeleteProducts(codes);
      return response.deletedCount;
    },
    onSuccess: (deletedCount) => {
      toast.success(`${deletedCount} productos eliminados!`);
      setSelectedProducts({});
      setShowConfirmDeleteModal(false);
    },
    onError: (error) => {
      toast.error(`Error al eliminar productos: ${error.message}`);
    }
  });

  const panes = [
    {
      menuItem: "Proveedor",
      render: () => (
        <Tab.Pane>
          {!isItemInactive(supplier?.state) &&
            <Flex Flex $marginBottom="15px">
              {toggleButton}
            </Flex>
          }
          {isItemInactive(supplier?.state) && (
            <Message negative>
              <MessageHeader>Motivo de inactivación</MessageHeader>
              <p>{supplier.inactiveReason}</p>
            </Message>
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
        </Tab.Pane >
      ),
    },
    {
      menuItem: "Productos del Proveedor",
      render: () => (
        <Tab.Pane>
          <Flex $flexDirection="column" $rowGap="15px" $margin="15px">
            <FormProvider {...methods}>
              <Form onSubmit={onSubmit(() => { })}>
                <Filters
                  entity={ENTITIES.PRODUCTS}
                  onRefetch={refetchProducts}
                  clearSelection={() => setSelectedProducts({})}
                  onRestoreFilters={onRestoreFilters}
                >
                  <DropdownControlled
                    width="200px"
                    name="state"
                    options={PRODUCT_STATES_OPTIONS}
                    defaultValue={EMPTY_FILTERS.state}
                    afterChange={() => {
                      onSubmit(() => { })();
                      setSelectedProducts({});
                    }}
                  />
                  <TextControlled name="code" placeholder="Código" width="200px" />
                  <TextControlled name="name" placeholder="Nombre" width="350px" />
                </Filters>
              </Form>
            </FormProvider>
            <Table
              isLoading={isLoading || deleteIsPending}
              mainKey="code"
              headers={PRODUCT_COLUMNS}
              elements={products.map((p, index) => ({ ...p, _key: `${p.code}_${index}` }))}
              page={PAGES.PRODUCTS}
              actions={tableActions}
              selection={selectedProducts}
              onSelectionChange={onSelectionChange}
              selectionActions={selectionActions}
              clearSelection={() => setSelectedProducts({})}
              selectAllCurrentPageElements={selectAllCurrentPageElements}
              onFilter={onFilter}
              color={PRODUCT_STATES[appliedFilters.state]?.color}
              paginate
            />
            <ModalAction
              showModal={showModalDelete}
              setShowModal={setShowModalDelete}
              title={`¿Está seguro que desea eliminar ${selectedProduct?.state === PRODUCT_STATES.DELETED.id ? "PERMANENTEMENTE" : ""} el producto "${selectedProduct?.name}"?`}
              onConfirm={mutateDeleteProduct}
              isLoading={isPending}
            />
          </Flex>
          <OnlyPrint>
            <PrintBarCodes ref={printRef} products={Object.values(selectedProducts)} />
          </OnlyPrint>
          <ModalMultiDelete
            open={showConfirmDeleteModal}
            onClose={() => setShowConfirmDeleteModal(false)}
            onConfirm={deleteSelectedProducts}
            elements={Object.values(selectedProducts)}
            icon={ICONS.TRASH}
            title="Estás seguro de que desea eliminar estos productos?"
            isLoading={deleteIsPending}
            headers={PRODUCT_COLUMNS}
          />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <Loader active={isLoading || loadingProducts}>
      <Tab panes={panes} />
      {!isUpdating && (
        <OnlyPrint>
          <PrintBarCodes ref={printRef} products={products} />
        </OnlyPrint>
      )}
      <UnsavedChangesModal
        open={showUnsavedModal}
        onDiscard={handleDiscard}
        onSave={handleSave}
        isSaving={isSaving}
        onCancel={handleCancel}
      />
      <ModalAction
        title={header}
        onConfirm={handleActionConfirm}
        confirmationWord={requiresConfirmation ? confirmText : ""}
        confirmButtonIcon={icon}
        showModal={isModalOpen}
        setShowModal={handleModalClose}
        isLoading={
          isDeleteBatchPending ||
          isDeletePending ||
          isActivePending ||
          isInactivePending
        }
        noConfirmation={!requiresConfirmation}
        bodyContent={
          modalAction === INACTIVE && (
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

export default Supplier;
