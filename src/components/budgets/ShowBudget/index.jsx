"use client";
import { SendButton } from "@/components/common/buttons";
import { get } from "lodash";
import { Icon, Label } from "semantic-ui-react";
import { formatedDate } from "@/utils";
import { PRODUCTS_COLUMNS } from "../budgets.common";
import { Table } from "@/components/common/table";
import {
  DataContainer,
  Button,
  Segment,
  SubContainer,
} from "./styles";
import { Flex } from "rebass";
import { NoPrint, OnlyPrint } from "@/components/layout";
import PDFFile from "../PDFfile";

const ShowBudget = ({ budget }) => {
  return (
    <>
      <NoPrint>
        <SubContainer>
          <DataContainer>
            <Label>Cliente</Label>
            <Segment>{get(budget, "customer.name", "")}</Segment>
          </DataContainer>
          <DataContainer>
            <Label>Fecha</Label>
            <Segment>{formatedDate(get(budget, "createdAt", ""))}</Segment>
          </DataContainer>
        </SubContainer>
        <Flex flexDirection="column" width="100%" marginTop="15px">
          <Label align="center">Productos</Label>
          <Table headers={PRODUCTS_COLUMNS} elements={budget?.products} />
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
