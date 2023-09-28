"use client";
import ButtonDelete from "@/components/ButtonDelete";
import { PAGES } from "@/constants";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button, Table } from 'semantic-ui-react';
import { HEADERS } from "../products.common";
import { MainContainer, ModButtonProduct, ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const ProductsPage = ({ products = [], deleteProduct }) => {
  const router = useRouter();

  return (
    <MainContainer>
      <ModLink href={PAGES.PRODUCTS.CREATE}>
        <ModButtonProduct color='green' content='Crear producto' icon='add' labelPosition='right' />
      </ModLink>
      <ModTable celled compact>
        <Table.Header fullWidth>
          <ModTableRow>
            <ModTableHeaderCell textAlign='center'></ModTableHeaderCell>
            {HEADERS.map((header) => (
              <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
            ))}
          </ModTableRow>
        </Table.Header>
        {products.map((product, index) => (
          <Table.Body key={product.code}>
            <ModTableRow >
              <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
              {HEADERS
                .filter(header => !header.hide)
                .map((header) => <ModTableCell
                  onClick={() => { router.push(PAGES.PRODUCTS.SHOW(product.code)) }}
                  key={header.id}
                  textAlign='center'>
                  {product[header.value]}
                </ModTableCell>)
              }
              <Table.Cell textAlign='center'>
                <Link href={PAGES.PRODUCTS.UPDATE(product.code)}>
                  <Button color='blue' size="tiny">Editar</Button>
                </Link>
                <ButtonDelete deleteProduct={deleteProduct} product={product} />
              </Table.Cell>
            </ModTableRow>
          </Table.Body>
        ))}
      </ModTable>
    </MainContainer>
  )
};

export default ProductsPage;