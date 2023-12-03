"use client";
import { deleteProduct } from "@/api/products";
import ButtonDelete from "@/components/buttons/Delete";
import ButtonDownload from "@/components/buttons/DownloadExcel";
import ButtonEdit from "@/components/buttons/Edit";
import ButtonGoTo from "@/components/buttons/GoTo";
import { PAGES } from "@/constants";
import { modPrice } from "@/utils";
import { useRouter } from 'next/navigation';
import { Table } from 'semantic-ui-react';
import ImportExcel from "../ImportProduct";
import { HEADERS } from "../products.common";
import { ButtonsContainer, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const ProductsPage = ({ products = [], createBatch, editBatch }) => {
  const router = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el producto "${name}"?`;

  return (
    <>
      <ButtonsContainer>
        <ButtonGoTo goTo={PAGES.PRODUCTS.CREATE} iconName="add" text="Crear producto" color="green" />
        <ImportExcel products={products} createBatch={createBatch} editBatch={editBatch} />
        <ButtonDownload />
      </ButtonsContainer>
      {!!products.length && <ModTable celled compact>
        <Table.Header fullWidth>
          <ModTableRow>
            <ModTableHeaderCell textAlign='center'></ModTableHeaderCell>
            {HEADERS.map((header) => (
              <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
            ))}
          </ModTableRow>
        </Table.Header>
        {products.map ? products.map((product, index) => (
          <Table.Body key={product.code}>
            <ModTableRow >
              <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
              {HEADERS
                .filter(header => !header.hide)
                .map((header) => <ModTableCell
                  onClick={() => { router.push(PAGES.PRODUCTS.SHOW(product.code)) }}
                  key={header.id}
                  textAlign='center'>
                  {header.value === "price" ? modPrice(product[header.value]) : product[header.value]}
                </ModTableCell>)
              }
              <Table.Cell textAlign='center'>
                <ButtonEdit page={"PRODUCTS"} element={product.code} />
                <ButtonDelete onDelete={deleteProduct} params={product.code} deleteQuestion={deleteQuestion(product.name)} />
              </Table.Cell>
            </ModTableRow>
          </Table.Body>
        )) : ""}
      </ModTable>}
    </>
  )
};

export default ProductsPage;