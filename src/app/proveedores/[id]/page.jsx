"use client";
import { deleteBatchProducts } from "@/api/products";
import { edit, useGetSupplier } from "@/api/suppliers";
import { ModalDelete } from "@/components/common/modals";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useRole, useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Supplier = ({ params }) => {
  useValidateToken();
  const role = useRole();
  const { push } = useRouter();
  const { supplier, isLoading } = useGetSupplier(params.id);
  const [allowUpdate, Toggle] = useAllowUpdate();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { setActions } = useNavActionsContext();
  const [open, setOpen] = useState(false);
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

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <Loader active={isLoading}>
      {Toggle}
      {open &&
        <ModalDelete
          showModal={open}
          setShowModal={setOpen}
          title={deleteQuestion(supplier?.name)}
          onDelete={deleteBatchProducts}
          batch
          params={supplier.id}
        />}
      <SupplierForm supplier={supplier} onSubmit={edit} readonly={!allowUpdate} />
    </Loader>
  )
};

export default Supplier;
