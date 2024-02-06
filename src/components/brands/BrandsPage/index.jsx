"use client";
import { ModalDelete } from "@/components/common/modals";
import { Table } from "@/components/common/table";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useCallback, useState } from "react";
import { BRAND_COLUMNS, FILTERS } from "../brands.common";

const BrandsPage = ({ brands = [], role, onDelete }) => {
  const visibilityRules = Rules(role);
  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteQuestion = (name) => `¿Está seguro que desea eliminar la marca "${name}"?`;

  const actions = visibilityRules.canSeeActions ? [
    {
      id: 1,
      icon: 'delete',
      color: 'red',
      onClick: (brand) => {
        setSelectedBrand(brand);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const handleDelete = useCallback(async () => {
    setIsLoading(true);
    await onDelete(selectedBrand?.id);
    setIsLoading(false);
  }, [onDelete, selectedBrand?.id]);

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
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </>
  )
};

export default BrandsPage;
