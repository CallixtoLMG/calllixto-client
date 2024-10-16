"use client";
import { useUserContext } from "@/User";
import { useDeleteBatchProducts, useProductsBySupplierId } from "@/api/products";
import { useActiveSupplier, useDeleteSupplier, useEditSupplier, useGetSupplier, useInactiveSupplier } from "@/api/suppliers";
import { Icon, Input } from "@/components/common/custom";
import PrintBarCodes from "@/components/common/custom/PrintBarCodes";
import { ModalAction } from "@/components/common/modals";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import SupplierView from "@/components/suppliers/SupplierView";
import { COLORS, ICONS, PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { isItemInactive } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

const Supplier = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: supplier, isLoading } = useGetSupplier(params.id);
  const { data: products, isLoading: loadingProducts } = useProductsBySupplierId(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isUpdating, Toggle] = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState(""); 
  const printRef = useRef(null);
  const editSupplier = useEditSupplier();
  const deleteSupplier = useDeleteSupplier();
  const deleteBatchProducts = useDeleteBatchProducts();
  const inactiveSupplier = useInactiveSupplier();
  const activeSupplier = useActiveSupplier();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.SUPPLIERS.NAME, supplier?.name]);
  }, [setLabels, supplier]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  const modalConfig = useMemo(() => ({
    deleteSupplier: {
      header: `¿Está seguro que desea eliminar PERMANENTEMENTE al proveedor "${supplier?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH
    },
    deleteBatch: {
      header: `¿Está seguro que desea eliminar todos los productos del proveedor "${supplier?.name}"?`,
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
  }), [supplier]);

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
  });

  const { mutate: mutateDeleteBatch, isPending: isDeleteBatchPending } = useMutation({
    mutationFn: async () => {
      const response = await deleteBatchProducts(params.id);
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
  });

  const handleActionConfirm = async () => {
    setActiveAction(modalAction);

    if (modalAction === "deleteBatch") {
      mutateDeleteBatch();
    } else if (modalAction === "deleteSupplier") {
      mutateDelete();
    } else if (modalAction === "inactive") {
      if (!reason) {
        toast.error("Debe proporcionar una razón para desactivar al cliente.");
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
        disabled: !!activeAction,
      },
      {
        id: 2,
        icon: isItemInactive(supplier?.state) ? ICONS.PLAY_CIRCLE : ICONS.PAUSE_CIRCLE,
        color: COLORS.GREY,
        text: isItemInactive(supplier?.state) ? "Activar" : "Desactivar",
        onClick: isItemInactive(supplier?.state) ? handleActivateClick : handleInactivateClick,
        loading: (activeAction === "active" || activeAction === "inactive"),
        disabled: !!activeAction,
        width: "fit-content",
      },
      {
        id: 3,
        icon: ICONS.LIST_UL,
        color: COLORS.RED,
        text: "Limpiar lista",
        onClick: handleDeleteBatchClick,
        loading: activeAction === "deleteBatch",
        disabled: !!activeAction,
        width: "fit-content",
      },
      {
        id: 4,
        icon: ICONS.TRASH,
        color: COLORS.RED,
        text: "Eliminar",
        onClick: handleDeleteClick,
        loading: activeAction === "deleteSupplier",
        disabled: !!activeAction,
        width: "fit-content",
        basic: true,
      },
    ] : [];

    setActions(actions);
  }, [role, activeAction, isActivePending, handleDeleteBatchClick, handleDeleteClick, handleActivateClick, handleInactivateClick, products, supplier?.state, setActions]);

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || loadingProducts}>
      {Toggle}
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
