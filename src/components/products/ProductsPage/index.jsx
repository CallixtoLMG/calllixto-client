"use client";
import { deleteProduct } from "@/app/productos/page";
import ButtonDelete from "@/components/ButtonDelete";
import ButtonEdit from "@/components/ButtonEdit";
import { PAGES } from "@/constants";
import { modPrice } from "@/utils";
import { useRouter } from 'next/navigation';
import { Button, Table } from 'semantic-ui-react';
import ImportExcel from "../ImportProduct";
import { HEADERS } from "../products.common";
import { MainContainer, ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow, SubContainer } from "./styles";

const ProductsPage = ({ products = [] }) => {
  const router = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el producto "${name}"?`

  return (
    <MainContainer>
      <SubContainer>
        <ModLink href={PAGES.PRODUCTS.CREATE}>
          <Button color='green' content='Crear producto' icon='add' labelPosition='right' />
        </ModLink>
        <ImportExcel />
      </SubContainer>
      <ModTable celled compact>
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
      </ModTable>
    </MainContainer>
  )
};

export default ProductsPage;