"use client";
import { ModalDelete } from "@/components/common/modals";
import { Table } from "@/components/common/table";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useCallback, useState } from "react";
import { FILTERS, SUPPLIERS_COLUMNS } from "../suppliers.common";

const SuppliersPage = ({ suppliers = [], role, onDelete }) => {
  const visibilityRules = Rules(role);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteQuestion = (name) => `¿Está seguro que desea eliminar la marca "${name}"?`;

  const actions = visibilityRules.canSeeActions ? [
    {
      id: 1,
      icon: 'delete',
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
      <Table
        headers={SUPPLIERS_COLUMNS}
        elements={suppliers}
        page={PAGES.SUPPLIERS}
        actions={actions}
        filters={FILTERS}
      />
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
