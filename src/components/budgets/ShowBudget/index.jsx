"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import ButtonSend from "@/components/buttons/Send";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { get } from "lodash";
import { Grid, Icon, Label, Table } from 'semantic-ui-react';
import { modDate, modPrice, totalSum } from '../../../utils';
import { PRODUCTSHEADERS } from "../budgets.common";
import { DataContainer, HeaderContainer, ModButton, ModGridColumn, ModLabel, ModSegment, ModTable, ModTableCell, ModTableFooterCell, ModTableHeaderCell, ModTableRow, SubContainer } from "./styles";

const ShowBudget = ({ budget }) => {
  function downloadPdf(data, filename) {
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    };
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
  };
  const handleDownloadPdf = async () => {
    const requestOptions = {
      method: 'GET',
      redirect: "follow",
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`
      },
      cache: "no-store"
    };
    const res = await fetch(`https://zosudnr9ag.execute-api.sa-east-1.amazonaws.com/pdf/${budget.id}`, requestOptions);
    let data = await res.text();
    downloadPdf(data, "myFileName.pdf");
  };

  return (
    <>
      <HeaderContainer>
        <ButtonGoTo goTo={PAGES.BUDGETS.BASE} iconName="chevron left" text="Volver atrás" color="green" />
        <PageHeader title={"Detalle"} />
      </HeaderContainer >
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
                  <ModTableFooterCell align="right" colSpan='5'><strong>TOTAL</strong></ModTableFooterCell>
                  <ModTableHeaderCell colSpan='1'><strong>{modPrice(totalSum(budget?.products))}</strong></ModTableHeaderCell>
                </Table.Row>
              </Table.Footer>
            </ModTable>
          </ModGridColumn>
        </Grid.Row>
        {budget && <ModButton onClick={handleDownloadPdf} color="blue" ><Icon name="download" />Descargar PDF</ModButton>}
        {(get(budget, "customer.phone") ||
          get(budget, "customer.email")) && (
            <ButtonSend customerData={get(budget, "customer", null)} />
          )}
      </Grid>
    </>
  )
};

export default ShowBudget;