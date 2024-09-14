"use client";
import { useUserContext } from "@/User";
import { deleteBatchProducts, useProductsBySupplierId } from "@/api/products";
import { LIST_SUPPLIERS_QUERY_KEY, deleteSupplier, edit, useGetSupplier } from "@/api/suppliers";
import { Icon } from "@/components/common/custom";
import PrintBarCodes from "@/components/common/custom/PrintBarCodes";
import { ModalAction } from "@/components/common/modals";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import SupplierView from "@/components/suppliers/SupplierView";
import { COLORS, ICONS, PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const printRef = useRef(null);
  const queryClient = useQueryClient();
console.log(products)
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
    deleteBatch: {
      header: `¿Está seguro que desea eliminar todos los productos del proveedor "${supplier?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH
    },
    deleteSupplier: {
      header: `¿Está seguro que desea eliminar PERMANENTEMENTE al proveedor "${supplier?.name}"?`,
      confirmText: "eliminar",
      icon: ICONS.TRASH
    },
  }), [supplier]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  const { mutate: mutateUpdate, isPending: isLoadingUpdate } = useMutation({
    mutationFn: async (supplier) => {
      const { data } = await edit(supplier);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Proveedor actualizado!');
        push(PAGES.SUPPLIERS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  const { mutate: mutateDeleteBatch, isPending: isLoadingDelete } = useMutation({
    mutationFn: async () => {
      const { data } = await deleteBatchProducts(params.id);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Lista de productos del proveedor eliminada!');
        // queryClient.invalidateQueries({ queryKey: [LIST_SUPPLIERS_QUERY_KEY], refetchType: "all" });
        handleModalClose();
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const { mutate: mutateDelete, isPending: isLoadingDeleteSupplier } = useMutation({
    mutationFn: async () => {
      const response = await deleteSupplier(params.id);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Proveedor eliminado permanentemente!');
        queryClient.invalidateQueries({ queryKey: [LIST_SUPPLIERS_QUERY_KEY], refetchType: "all" });
        push(PAGES.SUPPLIERS.BASE);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleActionConfirm = async () => {
    if (modalAction === "deleteBatch") {
      mutateDeleteBatch();
    } else if (modalAction === "deleteSupplier") {
      mutateDelete();
    }
    handleModalClose();
  };

  useEffect(() => {
    const handleBarCodePrint = async () => {
      if (products.length) {
        handlePrint();
      } else {
        toast.success('No hay productos de este proveedor', {
          icon: <Icon margin="0" toast name={ICONS.INFO_CIRCLE} color={COLORS.BLUE} />,
        });
      }
    };

    const actions = RULES.canRemove[role] ? [
      {
        id: 1,
        icon: ICONS.BARCODE,
        color: COLORS.BLUE,
        text: 'Códigos',
        onClick: handleBarCodePrint,
      },
      {
        id: 2,
        icon: ICONS.LIST_UL,
        color: COLORS.RED,
        text: 'Limpiar lista',
        onClick: () => {
          setModalAction("deleteBatch");
          setIsModalOpen(true);
        },
        width: "fit-content",
      },
      {
        id: 3,
        icon: ICONS.TRASH,
        color: COLORS.RED,
        text: 'Eliminar Proveedor',
        onClick: () => {
          setModalAction("deleteSupplier");
          setIsModalOpen(true);
        },
        width: "fit-content",
        basic: true,
      },
    ] : [];

    setActions(actions);
  }, [role, products, setActions]);

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || loadingProducts}>
      {Toggle}
      {isUpdating ? (
        <SupplierForm supplier={supplier} onSubmit={mutateUpdate} isLoading={isLoadingUpdate} isUpdating />
      ) : (
        <>
          <SupplierView supplier={supplier} />
          <OnlyPrint>
            <PrintBarCodes ref={printRef} products={products} />
          </OnlyPrint>
        </>
      )}
      <ModalAction
        title={modalConfig[modalAction]?.header}
        onConfirm={handleActionConfirm}
        confirmationWord={modalConfig[modalAction]?.confirmText}
        confirmButtonIcon={modalConfig[modalAction]?.icon}
        showModal={isModalOpen}
        setShowModal={setIsModalOpen}
        isLoading={isLoadingDelete || isLoadingDeleteSupplier}
      />
    </Loader>
  );
};

export default Supplier;
