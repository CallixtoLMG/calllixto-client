"use client";
import { DownloadExcelButton, GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useRouter } from 'next/navigation';
import { Flex } from "rebass";
import ImportExcel from "../ImportProduct";
import { PRODUCT_COLUMNS } from "../products.common";
import { ButtonContainer } from "./styles";
import { Table } from "@/components/common/Table";
import { useCallback } from "react";

const ProductsPage = ({ products = [], createBatch, editBatch, role, onDelete }) => {
  const { push } = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el producto "${name}"?`;
  const visibilityRules = Rules(role);

  const mapCustomersForTable = useCallback((c) => {
    return c.map(customer => ({ ...customer, key: customer.code }));
  }, []);

  return (
    <>
      {visibilityRules.canSeeButtons &&
        <ButtonContainer>
          <GoToButton goTo={PAGES.PRODUCTS.CREATE} iconName="add" text="Crear producto" color="green" />
          <Flex margin-left="auto">
            <ImportExcel products={products} createBatch={createBatch} editBatch={editBatch} />
            <DownloadExcelButton />
          </Flex>
        </ButtonContainer>}
      <Table headers={PRODUCT_COLUMNS} elements={mapCustomersForTable(products)} />
    </>
  )
};

export default ProductsPage;
