"use client";
import { ModalDelete } from "@/components/common/modals";
import { Table } from "@/components/common/table";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useState } from "react";
import { BRAND_COLUMNS, FILTERS } from "../brands.common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBrand, LIST_BRANDS_QUERY_KEY } from "@/api/brands";
import { toast } from "react-hot-toast";

const BrandsPage = ({ brands = [], role }) => {
  const visibilityRules = Rules(role);
  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const queryClient = useQueryClient();

  const deleteQuestion = (name) => `¿Está seguro que desea eliminar la marca "${name}"?`;

  const actions = visibilityRules.canSeeActions ? [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (brand) => {
        setSelectedBrand(brand);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await deleteBrand(selectedBrand?.id);
      return data
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BRANDS_QUERY_KEY] });
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
        headers={BRAND_COLUMNS}
        elements={brands}
        page={PAGES.BRANDS}
        actions={actions}
        filters={FILTERS}
      />
      <ModalDelete
        showModal={showModal}
        setShowModal={setShowModal}
        title={deleteQuestion(selectedBrand?.name)}
        onDelete={mutate}
        isLoading={isPending}
      />
    </>
  )
};

export default BrandsPage;
