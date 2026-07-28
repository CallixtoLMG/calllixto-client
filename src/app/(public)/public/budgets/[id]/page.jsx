"use client";

import { BUDGET_PDF_FORMAT } from "@/components/budgets/budgets.constants";
import PDFfile from "@/components/budgets/PDFfile";
import { getPublicBudgetSnapshot } from "@/components/budgets/publicBudget.mock";
import { useEffect, useState } from "react";
import { Header, Segment } from "semantic-ui-react";
import styled from "styled-components";

const PublicBudgetContainer = styled.div`
  width: min(960px, calc(100vw - 32px));
  margin: 32px auto;
`;

const PublicBudgetPage = ({ params }) => {
  const [hydrated, setHydrated] = useState(false);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    setSnapshot(getPublicBudgetSnapshot(params?.id));
    setHydrated(true);
  }, [params?.id]);

  if (!hydrated) return null;

  if (!snapshot) {
    return (
      <PublicBudgetContainer>
        <Segment placeholder>
          <Header as="h3" textAlign="center">
            No se encontró el presupuesto compartido.
          </Header>
        </Segment>
      </PublicBudgetContainer>
    );
  }

  const {
    account,
    budget,
    defaultsPDF = {},
    selectedContact,
    totals = {},
  } = snapshot;

  return (
    <PublicBudgetContainer>
      <Segment>
        <PDFfile
          budget={budget}
          account={account}
          printPdfMode={BUDGET_PDF_FORMAT.CUSTOMER.key}
          subtotal={totals.subtotal ?? 0}
          subtotalAfterDiscount={totals.subtotalAfterDiscount ?? 0}
          total={totals.total ?? 0}
          selectedContact={selectedContact}
          showPrices
          customPDFDisclaimer={defaultsPDF.customPDFDisclaimer}
          hideSensitiveData
        />
      </Segment>
    </PublicBudgetContainer>
  );
};

export default PublicBudgetPage;
