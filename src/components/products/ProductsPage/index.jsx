"use client";
import { DownloadExcelButton, GoToButton } from "@/components/common/buttons";
import { ModalDelete } from "@/components/common/modals";
import { Table } from "@/components/common/table";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useRouter } from 'next/navigation';
import { useCallback, useState } from "react";
import ImportProducts from "../ImportProduct";
import { FILTERS, PRODUCT_COLUMNS } from "../products.common";
import { ButtonsContainer } from "@/components/common/custom";

const ProductsPage = ({ products = [], createBatch, editBatch, role, onDelete }) => {
  const { push } = useRouter();
  const visibilityRules = Rules(role);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el producto "${name}"?`;

  const mapProductsForTable = useCallback((c) => {
    return c.map(customer => ({ ...customer, key: customer.code }));
  }, []);

  const actions = visibilityRules.canSeeActions ? [
    {
      id: 1,
      icon: 'edit',
      color: 'blue',
      onClick: (product) => { push(PAGES.PRODUCTS.UPDATE(product.code)) },
      tooltip: 'Editar'
    },
    {
      id: 2,
      icon: 'erase',
      color: 'red',
      onClick: (product) => {
        setSelectedProduct(product);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const handleDelete = useCallback(async () => {
    setIsLoading(true);
    await onDelete(selectedProduct?.code);
    setIsLoading(false);
  }, [onDelete, selectedProduct?.code]);

  return (
    <>
      {visibilityRules.canSeeButtons &&
        <ButtonsContainer>
          <GoToButton goTo={PAGES.PRODUCTS.CREATE} iconName="add" text="Crear producto" color="green" />
          <ImportProducts products={products} createBatch={createBatch} editBatch={editBatch} />
          <DownloadExcelButton />
        </ButtonsContainer>}
      <Table
        mainKey="code"
        headers={PRODUCT_COLUMNS}
        elements={mapProductsForTable(products)}
        page={PAGES.PRODUCTS}
        actions={actions}
        filters={FILTERS}
      />
      <ModalDelete
        showModal={showModal}
        setShowModal={setShowModal}
        title={deleteQuestion(selectedProduct?.name)}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </>
  )
};

export default ProductsPage;
