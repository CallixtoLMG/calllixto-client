"use client";
import { useUserContext } from "@/User";
import { deleteBatchProducts } from "@/api/products";
import { GET_SUPPLIER_QUERY_KEY, LIST_SUPPLIERS_QUERY_KEY, edit, useGetSupplier } from "@/api/suppliers";
import { ModalDelete } from "@/components/common/modals";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
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

  useEffect(() => {
    const visibilityRules = Rules(role);
    const actions = visibilityRules.canSeeButtons ? [
      {
        id: 1,
        icon: 'trash',
        color: 'red',
        onClick: () => setOpen(true),
        text: 'Limpiar lista'
      }
    ] : [];
    setActions(actions);
  }, [role, setActions]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (brand) => {
      const { data } = await edit(brand);
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
          onDelete={deleteBatchProducts}
          params={supplier.id}
        />}
      <SupplierForm supplier={supplier} onSubmit={mutate} readonly={!allowUpdate} isLoading={isPending} />
    </Loader>
  )
};

export default Supplier;
