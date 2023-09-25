"use client";
import ButtonDelete from "@/components/ButtonDelete";
import { PAGES } from "@/constants";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button, Container, Table } from 'semantic-ui-react';
import { HEADERS } from "../products.common";
import { MainContainer, ModTableHeaderCell, ModTableRow } from "./styles";

const ProductsPage = ({ products = [] }) => {
  const router = useRouter();

  return (
    <MainContainer>
      <Link href={PAGES.PRODUCTS.CREATE}>
        <Button color='green' content='Crear producto' icon='add' labelPosition='right' />
      </Link>
      <Table celled striped compact>
        <Table.Header fullWidth>
          <Table.Row>
            {HEADERS.map((header) => (
              <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        {products.map((product) => (
          <Table.Body key={product.code}>
            <ModTableRow onClick={() => { router.push(PAGES.PRODUCTS.SHOW(product.code)) }}>
              {HEADERS
                .filter(header => !header.hide)
                .map((header) => <Table.Cell key={header.id} textAlign='center'>{product[header.value]}</Table.Cell>)
              }
              <Table.Cell textAlign='center'>
                <Container fluid>
                  <Link href={PAGES.PRODUCTS.UPDATE(product.code)}>
                    <Button color='blue' size="tiny">Editar</Button>
                  </Link>
                  <ButtonDelete product={product} />
                </Container>
              </Table.Cell>
            </ModTableRow>
          </Table.Body>
        ))}
      </Table>
    </MainContainer>
  )
};

export default ProductsPage;