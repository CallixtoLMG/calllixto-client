"use client";
import { useUserContext } from "@/User";
import { useDeleteBySupplierId, useProductsBySupplierId } from "@/api/products";
import {
  useActiveSupplier,
  useDeleteSupplier,
  useEditSupplier,
  useGetSupplier,
  useInactiveSupplier,
} from "@/api/suppliers";
import {
  Icon,
  Message,
  MessageHeader,
} from "@/common/components/custom";
import PrintBarCodes from "@/common/components/custom/PrintBarCodes";
import { TextField } from "@/common/components/form";
import { ModalAction } from "@/common/components/modals";
import UnsavedChangesModal from "@/common/components/modals/ModalUnsavedChanges";
import { ACTIVE, COLORS, ICONS, INACTIVE, PAGES } from "@/common/constants";
import { downloadExcel, isItemInactive } from "@/common/utils";
import {
  Loader,
  OnlyPrint,
  useBreadcrumContext,
  useNavActionsContext,
} from "@/components/layout";
import { PRODUCT_STATES } from "@/components/products/products.constants";
import { getFormatedMargin } from "@/components/products/products.utils";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { useAllowUpdate, useProtectedAction, useUnsavedChanges, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

const Supplier = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: supplier, isLoading, refetch: refetchSupplier } = useGetSupplier(params.id);
  const { data: products, isLoading: loadingProducts, refetch: refetchProducts } =
    useProductsBySupplierId(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [reason, setReason] = useState("");
  const printRef = useRef(null);
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
  const editSupplier = useEditSupplier();
  const deleteSupplier = useDeleteSupplier();
  const deleteBySupplierId = useDeleteBySupplierId();
  const inactiveSupplier = useInactiveSupplier();
  const activeSupplier = useActiveSupplier();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.SUPPLIERS.NAME }, { name: supplier?.name }]);
    refetchSupplier();
    refetchProducts();
  }, [setLabels, supplier, refetchProducts, refetchSupplier]);

  const hasAssociatedProducts = useMemo(() => !!products?.length, [products]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  const modalConfig = {
    deleteSupplier: {
      header: (
        <>¿Está seguro que desea eliminar PERMANENTEMENTE al proveedor <i>{supplier?.name} ({supplier?.id}) </i> ?</>
      ),
      confirmText: "eliminar",
      icon: ICONS.TRASH,
      tooltip: hasAssociatedProducts
        ? 'No se puede eliminar este proveedor, existen productos asociados.'
        : false,
    },
    deleteBatch: {
      header: (
        <>¿Está seguro que desea eliminar los {products?.length || ""} productos del proveedor <i>{supplier?.name} ({supplier?.id}) </i> ?</>
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
    setIsModalOpen(false);
    setModalAction(null);
    setReason("");
  };

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

  const { mutate: mutateDelete, isPending: isDeletePending } =
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

  const handleActionConfirm = async () => {
    setActiveAction(modalAction);

    if (modalAction === "deleteBatch") {
      mutateDeleteBatch();
    }

    if (modalAction === "deleteSupplier") {
      mutateDelete();
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

    const handleDownloadExcel = () => {
      if (!products) return;
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

      const mappedProducts = products.map((product) => {
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
    };

    let actions = [];

    if (RULES.canRemove[role]) {
      const handleClick = (action) => () => handleProtectedAction(() => {
        setModalAction(action);
        setIsModalOpen(true);
      });

      actions = [{
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
        onClick: handleClick(isItemInactive(supplier?.state) ? ACTIVE : INACTIVE),
        loading: activeAction === ACTIVE || activeAction === INACTIVE,
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
        onClick: handleClick('deleteBatch'),
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
        onClick: handleClick('deleteSupplier'),
        loading: activeAction === "deleteSupplier",
        disabled: hasAssociatedProducts || !!activeAction || isEditPending,
        tooltip: hasAssociatedProducts
          ? 'No se puede eliminar este proveedor, existen productos asociados.'
          : false,
        width: "fit-content",
        basic: true,
      }];
    }

    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, supplier, products, hasAssociatedProducts, activeAction, isEditPending, loadingProducts, isExcelLoading]);

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || loadingProducts || !supplier}>
      {!isItemInactive(supplier?.state) && toggleButton}
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
