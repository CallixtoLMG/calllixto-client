"use client";
import ButtonGoto from "@/components/buttons/GoTo";
import ButtonSend from "@/components/buttons/Send";
import { PAGES } from "@/constants";
import { get } from "lodash";
import { Grid, Label, Table } from 'semantic-ui-react';
import { modDate, modPrice, totalSum } from '../../../utils';
import { PRODUCTSHEADERS } from "../budgets.common";
import { DataContainer, ModGridColumn, ModLabel, ModSegment, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow, SubContainer } from "./styles";

const ShowBudget = ({budget}) => {

  // function downloadPdf(data, filename) {
  //   const byteCharacters = atob(data);
  //   const byteNumbers = new Array(byteCharacters.length);

  //   for (let i = 0; i < byteCharacters.length; i++) {
  //     byteNumbers[i] = byteCharacters.charCodeAt(i);
  //   }

  //   const byteArray = new Uint8Array(byteNumbers);
  //   const blob = new Blob([byteArray], { type: 'application/pdf' });

  //   const url = URL.createObjectURL(blob);

  //   const enlaceDescarga = document.createElement('a');
  //   enlaceDescarga.href = url;
  //   enlaceDescarga.download = filename;

  //   document.body.appendChild(enlaceDescarga);
  //   enlaceDescarga.click();

  //   document.body.removeChild(enlaceDescarga);
  //   URL.revokeObjectURL(url);
  // }
  // useEffect(async () => {
  //   const requestOptions = {
  //     method: 'GET',
  //     // body: JSON.stringify({ pdfUrl: "https://www.google.com/asdasdas" }),
  //     redirect: "follow",
  //     headers: {
  //       authorization: `Bearer ${localStorage.getItem("token")}`
  //     },
  //     cache: "no-store"
  //   };
  //   const res = await fetch("https://4cxfyutpj4.execute-api.sa-east-1.amazonaws.com/pdf", requestOptions);
  //   let data = await res.text();
  //   downloadPdf(data.replace("data:application/pdf;base64,", ""), "myFileName.pdf");
  // }, [])

  return (
    <>
      <SubContainer>
        <DataContainer>
          <ModLabel>Cliente</ModLabel>
          <ModSegment>{get(budget, "customer.name", "")}</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel> Fecha </ModLabel>
          <ModSegment>{modDate(get(budget, "createdAt", ""))}</ModSegment>
        </DataContainer>
      </SubContainer>
      <Grid >
        <Grid.Row stretched>
          <ModGridColumn  >
            <Label> Productos </Label>
            <ModTable celled compact>
              <Table.Header fullWidth>
                <ModTableRow>
                  <ModTableHeaderCell $header></ModTableHeaderCell>
                  {PRODUCTSHEADERS.map((header) => (
                    <ModTableHeaderCell $header key={header.id} >{header.name}</ModTableHeaderCell>
                  ))}
                </ModTableRow>
              </Table.Header>
              {budget?.products?.map((product, index) => (
                <Table.Body key={product.code}>
                  <ModTableRow >
                    <ModTableCell >{index + 1}</ModTableCell>
                    {PRODUCTSHEADERS
                      .filter(header => !header.hide)
                      .map((header) =>
                        <ModTableCell key={header.id}>
                          {header.modPrice ? modPrice(get(product, header.value, '')) : get(product, header.value, '')}
                        </ModTableCell>)
                    }
                  </ModTableRow>
                </Table.Body>
              ))}
              <Table.Footer celled fullWidth>
                <Table.Row>
                  <ModTableHeaderCell align="right" colSpan='5'><strong>TOTAL</strong></ModTableHeaderCell>
                  <ModTableHeaderCell colSpan='1'><strong>{modPrice(totalSum(budget?.products))}</strong></ModTableHeaderCell>
                </Table.Row>
              </Table.Footer>
            </ModTable>
          </ModGridColumn>
        </Grid.Row>
        {budget && <ButtonGoto goTo={PAGES.BUDGETS.SHOWPDF(budget?.id)} iconName="eye" text="Ver PDF" color="blue" />}
        {(get(budget, "customer.phone") ||
          get(budget, "customer.email")) && (
            <ButtonSend customerData={get(budget, "customer", null)} />
          )}
      </Grid>
    </>
  )
};

export default ShowBudget;