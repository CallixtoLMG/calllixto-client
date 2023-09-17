"use client";
import ButtonDelete from "@/components/ButtonDelete";
import PopUpEdit from "@/components/PopUpEdit";
import { useRouter } from 'next/navigation';
import { Button, Container, Table } from 'semantic-ui-react';
import { MainContainer, ModTableHeaderCell, ModTableRow } from "./styles";
import Link from "next/link";
import { PAGES } from "@/constants";
import { HEADERS } from "../products.common";

const ProductsPage = ({ products = [] }) => {
  const router = useRouter();

  return (
    <MainContainer>
      <Link href={PAGES.PRODUCTS.CREATE}>
        <Button color='green' content='Crear producto' icon='add' labelPosition='right' />
      </Link>
      <Table striped celled compact definition>
        <Table.Header fullWidth>
          <Table.Row>
            {HEADERS.map((header) => (
              <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        {products.map((product) => (
          <Table.Body key={product.code}>
            <ModTableRow onClick={() => { router.push(PAGES.PRODUCTS.SHOW(product.code)) }} >
              {HEADERS
                .filter(header => !header.hide)
                .map((header) => <Table.Cell textAlign='center'>{product[header.value]}</Table.Cell>)
              }
              <Table.Cell textAlign='center'>
                <Container fluid>
                  <PopUpEdit product={product} />
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