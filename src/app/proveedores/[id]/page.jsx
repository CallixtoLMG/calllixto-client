"use client";
import { useUserContext } from "@/User";
import { useDeleteBySupplierId, useProductsBySupplierId } from "@/api/products";
import { useActiveSupplier, useDeleteSupplier, useEditSupplier, useGetSupplier, useInactiveSupplier } from "@/api/suppliers";
import { Icon, Input } from "@/components/common/custom";
import PrintBarCodes from "@/components/common/custom/PrintBarCodes";
import { ModalAction } from "@/components/common/modals";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import SupplierView from "@/components/suppliers/SupplierView";
import { COLORS, ICONS, PAGES, PRODUCT_STATES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { downloadExcel, formatedPrice, isItemInactive } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

const Supplier = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: supplier, isLoading, refetch } = useGetSupplier(params.id);
  const { data: products, isLoading: loadingProducts } = useProductsBySupplierId(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { isUpdating, toggleButton } = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [reason, setReason] = useState("");
  const printRef = useRef(null);
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
    setLabels([PAGES.SUPPLIERS.NAME, supplier?.name]);
    refetch();
  }, [setLabels, supplier, refetch]);

  const hasAssociatedProducts = useMemo(() => {
    return products?.length > 0;
  }, [products]);

  const prepareProductDataForExcel = useMemo(() => {
    if (!products) return [];
    const headers = ['Código', 'Nombre', 'Marca', 'Proveedor', 'Precio', 'Estado', 'Comentarios'];

    const productData = products.map(product => {
      const productState = PRODUCT_STATES[product.state]?.singularTitle || product.state;
      return [
        product.code,
        product.name,
        product.brandName,
        product.supplierName,
        formatedPrice(product.price),
        productState,
        product.comments
      ];
    });

    return [headers, ...productData];
  }, [products]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  const modalConfig = {
    deleteSupplier: {
      header: `¿Está seguro que desea eliminar PERMANENTEMENTE al proveedor "${supplier?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH,
      tooltip: hasAssociatedProducts ? "No se puede eliminar este proveedor, existen productos asociados." : false,
    },
    deleteBatch: {
      header: `¿Está seguro que desea eliminar los ${products?.length || ""} productos del proveedor "${supplier?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH
    },
    active: {
      header: `¿Está seguro que desea activar el proveedor "${supplier?.name}"?`,
      icon: ICONS.PLAY_CIRCLE,
    },
    inactive: {
      header: `¿Está seguro que desea desactivar el proveedor "${supplier?.name}"?`,
      icon: ICONS.PAUSE_CIRCLE,
    }
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

  const handleActivateClick = useCallback(() => handleOpenModalWithAction("active"), [handleOpenModalWithAction]);
  const handleInactivateClick = useCallback(() => handleOpenModalWithAction("inactive"), [handleOpenModalWithAction]);
  const handleDeleteClick = useCallback(() => handleOpenModalWithAction("deleteSupplier"), [handleOpenModalWithAction]);
  const handleDeleteBatchClick = useCallback(() => handleOpenModalWithAction("deleteBatch"), [handleOpenModalWithAction]);

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: async (supplier) => {
      const data = await editSupplier(supplier);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Proveedor actualizado!');
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

  const { mutate: mutateActive, isPending: isActivePending } = useMutation({
    mutationFn: async ({ supplier }) => {
      const response = await activeSupplier(supplier);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Proveedor activado!");
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

  const { mutate: mutateInactive, isPending: isInactivePending } = useMutation({
    mutationFn: async ({ supplier, reason }) => {
      const response = await inactiveSupplier(supplier, reason);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Proveedor desactivado!");
        push(PAGES.SUPPLIERS.BASE);
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

  const { mutate: mutateDeleteBatch, isPending: isDeleteBatchPending } = useMutation({
    mutationFn: async () => {
      const response = await deleteBySupplierId(params.id);
      return response;
    },
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

  const { mutate: mutateDelete, isPending: isDeleteSupplierPending } = useMutation({
    mutationFn: async () => {
      const response = await deleteSupplier(params.id);
      return response;
    },
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
    } else if (modalAction === "deleteSupplier") {
      mutateDelete();
    } else if (modalAction === "inactive") {
      if (!reason) {
        toast.error("Debe proporcionar una razón para desactivar al proveedor.");
        return;
      }
      mutateInactive({ supplier, reason });
    } else if (modalAction === "active") {
      mutateActive({ supplier });
    }

    handleModalClose();
  };

  const { header, confirmText = "", icon = ICONS.QUESTION } = modalConfig[modalAction] || {};
  const requiresConfirmation = modalAction === "deleteSupplier" || modalAction === "deleteBatch";

  useEffect(() => {
    const handleBarCodePrint = () => {
      if (products?.length) {
        setActiveAction("print");
        handlePrint();
        setActiveAction(null);
      } else {
        toast("No hay productos de este proveedor.", {
          icon: <Icon margin="0" toast name={ICONS.INFO_CIRCLE} color={COLORS.BLUE} />,
        });
      }
    };

    const actions = RULES.canRemove[role] ? [
      {
        id: 1,
        icon: ICONS.BARCODE,
        color: COLORS.BLUE,
        text: "Códigos",
        onClick: handleBarCodePrint,
        loading: activeAction === "print",
        disabled: !!activeAction || isEditPending,
      },
      {
        id: 2,
        icon: isItemInactive(supplier?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
        color: COLORS.GREY,
        text: isItemInactive(supplier?.state) ? "Activar" : "Desactivar",
        onClick: isItemInactive(supplier?.state) ? handleActivateClick : handleInactivateClick,
        loading: (activeAction === "active" || activeAction === "inactive"),
        disabled: !!activeAction || isEditPending,
        width: "fit-content",
      },
      {
        id: 3,
        icon: ICONS.FILE_EXCEL,
        color: COLORS.SOFT_GREY,
        text: "Descargar lista",
        onClick: () => {
          if (products?.length) {
            setIsExcelLoading(true);
            downloadExcel(prepareProductDataForExcel, `Lista de productos de ${supplier.name}`);
            setIsExcelLoading(false);
          } else {
            toast("No hay productos de este proveedor para descargar.", {
              icon: <Icon margin="0" toast name={ICONS.INFO_CIRCLE} color={COLORS.BLUE} />,
            });
          }
        },
        loading: isExcelLoading,
        disabled: isExcelLoading || !!activeAction || loadingProducts || isEditPending,
        width: "fit-content",
      },
      {
        id: 4,
        icon: ICONS.LIST_UL,
        color: COLORS.RED,
        text: "Limpiar lista",
        onClick: handleDeleteBatchClick,
        loading: activeAction === "deleteBatch",
        disabled: !hasAssociatedProducts || !!activeAction || isEditPending,
        tooltip: !hasAssociatedProducts ? "No existen productos asociados." : false,
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
        tooltip: hasAssociatedProducts ? "No se puede eliminar este proveedor, existen productos asociados." : false,
        width: "fit-content",
        basic: true,
      },
    ] : [];

    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, activeAction, hasAssociatedProducts, isActivePending, isExcelLoading, isEditPending, handleDeleteBatchClick, loadingProducts, prepareProductDataForExcel, supplier?.name, handleDeleteClick, handleActivateClick, handleInactivateClick, products, supplier?.state, setActions]);

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || loadingProducts}>
      {toggleButton}
      {isUpdating ? (
        <SupplierForm supplier={supplier} onSubmit={mutateEdit} isLoading={isEditPending} isUpdating />
      ) : (
        <>
          <SupplierView supplier={supplier} />
          <OnlyPrint>
            <PrintBarCodes ref={printRef} products={products} />
          </OnlyPrint>
        </>
      )}
      <ModalAction
        title={header}
        onConfirm={handleActionConfirm}
        confirmationWord={requiresConfirmation ? confirmText : ""}
        confirmButtonIcon={icon}
        showModal={isModalOpen}
        setShowModal={handleModalClose}
        isLoading={isDeleteBatchPending || isDeleteSupplierPending || isActivePending || isInactivePending}
        noConfirmation={!requiresConfirmation}
        bodyContent={
          modalAction === "inactive" && (
            <Input
              type="text"
              placeholder="Indique la razón de desactivación"
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
