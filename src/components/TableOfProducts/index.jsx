"use client"
import AddProducts from "@/components/AddProducts";
import ButtonDelete from "@/components/ButtonDelete";
import Pager from "@/components/Pager";
import PopUpEdit from "@/components/PopUpEdit";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Container, Table } from 'semantic-ui-react';
import { MainContainer, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const TableOfProducts = ({ headerNames, products }) => {
  const router = useRouter();

  return (
    <>
      <MainContainer>
        <AddProducts />
        <Link href="/prueba2"> <button>PRUEBA2</button></Link>
        <Table striped celled compact definition>
          <Table.Header fullWidth>
            <Table.Row>
              {headerNames.map((header) => (
                <ModTableHeaderCell key={header.id} textAlign='center'>{header.name}</ModTableHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          {products?.map((product) => (
            <Table.Body key={product.id}>
              <ModTableRow >
                <ModTableCell onClick={() => { router.push("/productos/1") }} textAlign='center'>{product.id}</ModTableCell>
                <Table.Cell onClick={() => { router.push("/productos/1") }}><Link href={`/productos/${product.id}`}>{product.name}</Link></Table.Cell>
                <Table.Cell onClick={() => { router.push("/productos/1") }} textAlign='center'>{product.stock}</Table.Cell>
                <Table.Cell onClick={() => { router.push("/productos/1") }} textAlign='center'>{product.price}</Table.Cell>
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
      <Container textAlign="center">
        <Pager />
      </Container>
    </>
  )
};

export default TableOfProducts;