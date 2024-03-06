"use client";
import { useUserContext } from "@/User";
import { LIST_PRODUCTS_QUERY_KEY, deleteBatchProducts } from "@/api/products";
import { GET_SUPPLIER_QUERY_KEY, LIST_SUPPLIERS_QUERY_KEY, edit, useGetSupplier } from "@/api/suppliers";
import { ModalDelete } from "@/components/common/modals";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const Supplier = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: supplier, isLoading, isRefetching } = useGetSupplier(params.id);
  const [allowUpdate, Toggle] = useAllowUpdate();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { setActions } = useNavActionsContext();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteQuestion = (name) => `¿Está seguro que desea eliminar todos los productos de la marca "${name}"?`;
  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Proveedores', supplier?.name]);
  }, [setLabels, supplier]);

  // useEffect(() => {
  //   const visibilityRules = Rules(role);
  //   const actions = visibilityRules.canSeeButtons ? [
  //     {
  //       id: 1,
  //       icon: 'trash',
  //       color: 'red',
  //       onClick: () => setOpen(true),
  //       text: 'Limpiar lista'
  //     }
  //   ] : [];
  //   setActions(actions);
  // }, [role, setActions]);

  const { mutate: mutateUpdate, isPending: isLoadingUpdate } = useMutation({
    mutationFn: async (supplier) => {
      const { data } = await edit(supplier);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_SUPPLIERS_QUERY_KEY] });
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
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
        toast.success('Lista de productos del proveedor eliminada!');
        setOpen(false)
      } else {
        toast.error(response.message);
      }
    },
  });

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <Loader active={isLoading || isRefetching}>
      {Toggle}
      {open &&
        <ModalDelete
          showModal={open}
          setShowModal={setOpen}
          title={deleteQuestion(supplier?.name)}
          onDelete={mutateDelete}
          isLoading={isLoadingDelete}

        />}
      <SupplierForm supplier={supplier} onSubmit={mutateUpdate} readonly={!allowUpdate} isLoading={isLoadingUpdate} />
    </Loader>
  )
};

export default Supplier;
