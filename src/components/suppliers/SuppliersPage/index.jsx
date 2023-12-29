"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useRouter } from 'next/navigation';
import { ButtonContainer } from "./styles";
import { Table } from "@/components/common/table";
import { useCallback, useState } from "react";
import { ModalDelete } from "@/components/common/modals";
import { SUPPLIERS_COLUMNS } from "../suppliers.common";

const SuppliersPage = ({ suppliers = [], role, onDelete }) => {
  const { push } = useRouter();
  const visibilityRules = Rules(role);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteQuestion = (name) => `¿Está seguro que desea eliminar la marca "${name}"?`;

  const actions = visibilityRules.canSeeActions ? [
    {
      id: 1,
      icon: 'edit',
      color: 'blue',
      onClick: (supplier) => { push(PAGES.SUPPLIERS.UPDATE(supplier.id)) },
      tooltip: 'Editar'
    },
    {
      id: 2,
      icon: 'erase',
      color: 'red',
      onClick: (supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const handleDelete = useCallback(async () => {
    setIsLoading(true);
    await onDelete(selectedSupplier?.id);
    setIsLoading(false);
  }, [onDelete, selectedSupplier?.id]);

  return (
    <>
      {visibilityRules.canSeeButtons &&
        <ButtonContainer>
          <GoToButton goTo={PAGES.SUPPLIERS.CREATE} iconName="add" text="Crear proveedor" color="green" />
        </ButtonContainer>}
      <Table headers={SUPPLIERS_COLUMNS} elements={suppliers} page={PAGES.SUPPLIERS} actions={actions} />
      <ModalDelete
        showModal={showModal}
        setShowModal={setShowModal}
        title={deleteQuestion(selectedSupplier?.name)}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </>
  )
};

export default SuppliersPage;
