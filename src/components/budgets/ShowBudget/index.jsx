"use client";
import { SendButton } from "@/components/common/buttons";
import { get } from "lodash";
import { Icon, Label } from "semantic-ui-react";
import { formatedDate, formatedPhone } from "@/utils";
import { PRODUCTS_COLUMNS } from "../budgets.common";
import { Table } from "@/components/common/table";
import {
  DataContainer,
  Button,
  SubContainer,
} from "./styles";
import { Flex } from "rebass";
import { NoPrint, OnlyPrint } from "@/components/layout";
import PDFFile from "../PDFfile";
import { getTotalSum, formatedPrice } from "@/utils";
import { Segment } from "@/components/common/forms";

const ShowBudget = ({ budget }) => {
  return (
    <>
      <NoPrint>
        <SubContainer>
          <DataContainer>
            <Label>Vendedor</Label>
            <Segment>{budget?.seller}</Segment>
          </DataContainer>
          <DataContainer width="200px">
            <Label>Fecha</Label>
            <Segment>{formatedDate(get(budget, "createdAt", ""))}</Segment>
          </DataContainer>
        </SubContainer>
        <SubContainer marginTop="15px">
          <DataContainer>
            <Label>Cliente</Label>
            <Segment>{get(budget, "customer.name")}</Segment>
          </DataContainer>
          <DataContainer flex="1">
            <Label>Dirección</Label>
            <Segment>{get(budget, "customer.address")}</Segment>
          </DataContainer>
          <DataContainer width="200px">
            <Label>Teléfono</Label>
            <Segment>{formatedPhone(get(budget, "customer.phone.areaCode"), get(budget, "customer.phone.number"))}</Segment>
          </DataContainer>
        </SubContainer>
        <Flex flexDirection="column" width="100%" marginTop="15px">
          <Label align="center">Productos</Label>
          <Table headers={PRODUCTS_COLUMNS} elements={budget?.products} total={formatedPrice(getTotalSum(budget?.products))} />
          <Flex>
            <Button onClick={() => window.print()} color="blue">
              <Icon name="download" />Descargar PDF
            </Button>
            {(get(budget, "customer.phone") || get(budget, "customer.email")) && (
              <SendButton customerData={budget.customer} />
            )}
          </Flex>
        </Flex>
      </NoPrint>
      <OnlyPrint>
        <PDFFile budget={budget} />
      </OnlyPrint>
    </>
  );
};

export default ShowBudget;
