"use client";
import ButtonDelete from "@/components/buttons/Delete";
import ButtonDownload from "@/components/buttons/DownloadExcel";
import ButtonEdit from "@/components/buttons/Edit";
import ButtonGoTo from "@/components/buttons/GoTo";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useRouter } from 'next/navigation';
import { Flex } from "rebass";
import { Table } from 'semantic-ui-react';
import ImportExcel from "../ImportProduct";
import { PRODUCT_COLUMNS } from "../products.common";
import { ButtonContainer, Cell, HeaderCell } from "./styles";

const ProductsPage = ({ products = [], createBatch, editBatch, role, onDelete }) => {
  const { push } = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el producto "${name}"?`;
  const visibilityRules = Rules(role);

  return (
    <>
      {visibilityRules.canSeeButtons &&
        <ButtonContainer>
          <ButtonGoTo goTo={PAGES.PRODUCTS.CREATE} iconName="add" text="Crear producto" color="green" />
          <Flex margin-left="auto">
            <ImportExcel products={products} createBatch={createBatch} editBatch={editBatch} />
            <ButtonDownload />
          </Flex>
        </ButtonContainer>}
      <Table celled compact striped>
        <Table.Header fullWidth>
          <HeaderCell />
          {PRODUCT_COLUMNS.map((column) => (
            <HeaderCell key={column.id}>{column.title}</HeaderCell>
          ))}
          {visibilityRules.canSeeActions && <HeaderCell>Acciones</HeaderCell>}
        </Table.Header>
        <Table.Body>
          {products?.map((product, index) => (
            <Table.Row key={product.code}>
              <Cell>{index + 1}</Cell>
              {PRODUCT_COLUMNS
                .map((column) =>
                  <Cell key={column.id} onClick={() => { push(PAGES.PRODUCTS.SHOW(product.code)) }}>
                    {column.value(product)}
                  </Cell>)
              }
              {visibilityRules.canSeeActions &&
                <Cell >
                  <ButtonEdit page={"PRODUCTS"} element={product.code} />
                  <ButtonDelete onDelete={onDelete} params={product.code} deleteQuestion={deleteQuestion(product.name)} />
                </Cell>}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  )
};

export default ProductsPage;
