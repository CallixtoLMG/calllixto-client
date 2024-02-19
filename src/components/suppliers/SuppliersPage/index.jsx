"use client";
import { ModalDelete } from "@/components/common/modals";
import { Table } from "@/components/common/table";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useState } from "react";
import { FILTERS, SUPPLIERS_COLUMNS } from "../suppliers.common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSupplier, LIST_SUPPLIERS_QUERY_KEY } from "@/api/suppliers";
import { toast } from "react-hot-toast";

const SuppliersPage = ({ suppliers = [], role, onDelete }) => {
  const visibilityRules = Rules(role);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const queryClient = useQueryClient();

  const deleteQuestion = (name) => `¿Está seguro que desea eliminar la marca "${name}"?`;

  const actions = visibilityRules.canSeeActions ? [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await deleteSupplier(selectedSupplier?.id);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_SUPPLIERS_QUERY_KEY] });
        toast.success('Marca eliminada!');
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    },
  });

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
        onDelete={mutate}
        isLoading={isPending}
      />
    </>
  )
};

export default SuppliersPage;
