"use client";
import ButtonDelete from "@/components/buttons/Delete";
import ButtonDownload from "@/components/buttons/DownloadExcel";
import ButtonEdit from "@/components/buttons/Edit";
import ButtonGoTo from "@/components/buttons/GoTo";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { modPrice } from "@/utils";
import { Rules } from "@/visibilityRules";
import { useRouter } from 'next/navigation';
import { Table } from 'semantic-ui-react';
import ImportExcel from "../ImportProduct";
import { HEADERS } from "../products.common";
import { ButtonContainer, HeaderContainer, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const ProductsPage = ({ products = [], createBatch, editBatch, role, isLoading, onDelete }) => {
  console.log(products)
  const router = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el producto "${name}"?`;
  const visibilityRules = Rules(role)
  return (
    <>
      <Loader active={isLoading}>
        <HeaderContainer>
          <PageHeader title={"Productos"} />
        </HeaderContainer>
        {visibilityRules.canSeeButtons &&
          <ButtonContainer>
            <ButtonGoTo goTo={PAGES.PRODUCTS.CREATE} iconName="add" text="Crear producto" color="green" />
            <ImportExcel products={products} createBatch={createBatch} editBatch={editBatch} />
            <ButtonDownload />
          </ButtonContainer>}
        <ModTable celled compact>
          <Table.Header fullWidth>
            <ModTableRow>
              <ModTableHeaderCell ></ModTableHeaderCell>
              {HEADERS.filter(header => !header.hide || (header.value === "actions" && visibilityRules.canSeeButtons))
                .map((header) => (
                  <ModTableHeaderCell key={header.id} >{header.name}</ModTableHeaderCell>
                ))}
            </ModTableRow>
          </Table.Header>
          {products.map ? products.map((product, index) => (
            <Table.Body key={product.code}>
              <ModTableRow >
                <ModTableCell >{index + 1}</ModTableCell>
                {HEADERS
                  .filter(header => !header.hide)
                  .map((header) =>
                    <ModTableCell key={header.id} onClick={() => { router.push(PAGES.PRODUCTS.SHOW(product.code)) }}>
                      {header.value === "price" ? modPrice(product[header.value]) : product[header.value]}
                    </ModTableCell>)
                }
                {visibilityRules.canSeeActions &&
                  <ModTableCell >
                    <ButtonEdit page={"PRODUCTS"} element={product.code} />
                    <ButtonDelete onDelete={onDelete} params={product.code} deleteQuestion={deleteQuestion(product.name)} />
                  </ModTableCell>}
              </ModTableRow>
            </Table.Body>
          )) : ""}
        </ModTable>
      </Loader>
    </>
  )
};

export default ProductsPage;
