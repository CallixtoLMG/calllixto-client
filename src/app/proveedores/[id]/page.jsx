"use client";
import { useUserContext } from "@/User";
import { deleteBatchProducts, useListAllProducts } from "@/api/products";
import { GET_SUPPLIER_QUERY_KEY, edit, useGetSupplier } from "@/api/suppliers";
import { Icon } from "@/components/common/custom";
import PrintBarCodes from "@/components/common/custom/BarCode";
import { ModalDelete } from "@/components/common/modals";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ATTRIBUTES } from "@/components/products/products.common";
import SupplierForm from "@/components/suppliers/SupplierForm";
import SupplierView from "@/components/suppliers/SupplierView";
import { PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

const Supplier = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { data: supplier, isLoading, isRefetching } = useGetSupplier(params.id);
  const { role } = useUserContext();
  const [isUpdating, Toggle] = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar todos los productos de la marca "${name}"?`;
  const printRef = useRef();

  const { data: productsData, isLoading: loadingProducts, refetch } = useListAllProducts({
    attributes: [ATTRIBUTES.CODE, ATTRIBUTES.NAME],
    enabled: false,
    code: supplier?.id,
  });

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



  useEffect(() => {
    const handleBarCodePrint = async () => {
      const { data } = await refetch();
      if (data?.products?.length) {
        handlePrint();
      } else {
        toast.success('No hay productos de este proveedor', {
          icon:<Icon margin="0" toast name="info circle" color="blue" />,
        });
      }
    };

    const actions = RULES.canRemove[role]
      ? [
        {
          id: 1,
          icon: 'barcode',
          color: 'blue',
          text: 'Códigos',
          onClick: handleBarCodePrint,
        },
        {
          id: 2,
          icon: 'trash',
          color: 'red',
          onClick: () => setOpen(true),
          text: 'Limpiar lista',
        },
      ]
      : [];
    setActions(actions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, role, setActions]);

  const { mutate: mutateUpdate, isPending: isLoadingUpdate } = useMutation({
    mutationFn: async (supplier) => {
      const { data } = await edit(supplier);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [GET_SUPPLIER_QUERY_KEY, params.id] });
        toast.success('Proveedor actualizado!');
        push(PAGES.SUPPLIERS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  const { mutate: mutateDelete, isPending: isLoadingDelete } = useMutation({
    mutationFn: async () => {
      const { data } = await deleteBatchProducts(params.id);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Lista de productos del proveedor eliminada!');
        setOpen(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <Loader active={isLoading || isRefetching || loadingProducts}>
      {Toggle}
      {open &&
        <ModalDelete
          showModal={open}
          setShowModal={setOpen}
          title={deleteQuestion(supplier?.name)}
          onDelete={mutateDelete}
          isLoading={isLoadingDelete}
        />}
      {isUpdating ? (
        <SupplierForm supplier={supplier} onSubmit={mutateUpdate} isLoading={isLoadingUpdate} isUpdating />
      ) : (
        <>
          <SupplierView supplier={supplier} />
          <OnlyPrint>
            <PrintBarCodes ref={printRef} products={productsData?.products} />
          </OnlyPrint>
        </>
      )}
    </Loader>
  );
};

export default Supplier;
