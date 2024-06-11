"use client";
import { LIST_SUPPLIERS_QUERY_KEY, deleteSupplier } from "@/api/suppliers";
import { ModalDelete } from "@/components/common/modals";
import { Table } from "@/components/common/table";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FILTERS, SUPPLIERS_COLUMNS } from "../suppliers.common";

const SuppliersPage = ({ suppliers = [], role, isLoading, isRefetching }) => {
  const visibilityRules = Rules(role);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const queryClient = useQueryClient();
  const { resetFilters } = usePaginationContext();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar la marca "${name}"?`;

  const onFilter = (data) => {
    const filters = { ...data };
    if (data.id) {
      filters.sort = "id";
    }
    if (data.name) {
      filters.sort = "name";
    }
    resetFilters(filters);
  };

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
        isLoading={isLoading}
        isRefetching={isRefetching}
        headers={SUPPLIERS_COLUMNS}
        elements={suppliers}
        page={PAGES.SUPPLIERS}
        actions={actions}
        filters={FILTERS}
        onFilter={onFilter}
        usePagination
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
