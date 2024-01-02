"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useRouter } from 'next/navigation';
import { Table } from "@/components/common/table";
import { useCallback, useState } from "react";
import { ModalDelete } from "@/components/common/modals";
import { BRAND_COLUMNS, FILTERS } from "../brands.common";
import { ButtonsContainer } from "@/components/common/custom";

const BrandsPage = ({ brands = [], role, onDelete }) => {
  const { push } = useRouter();
  const visibilityRules = Rules(role);
  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteQuestion = (name) => `¿Está seguro que desea eliminar la marca "${name}"?`;

  const actions = visibilityRules.canSeeActions ? [
    {
      id: 1,
      icon: 'edit',
      color: 'blue',
      onClick: (brand) => { push(PAGES.BRANDS.UPDATE(brand.id)) },
      tooltip: 'Editar'
    },
    {
      id: 2,
      icon: 'erase',
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
      {visibilityRules.canSeeButtons &&
        <ButtonsContainer>
          <GoToButton goTo={PAGES.BRANDS.CREATE} iconName="add" text="Crear marca" color="green" />
        </ButtonsContainer>}
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
