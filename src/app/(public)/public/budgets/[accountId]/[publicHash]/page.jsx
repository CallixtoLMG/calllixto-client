"use client";

import { getPublicBudget } from "@/api/budgets";
import { getFormatedPhone } from "@/common/utils";
import { BUDGET_PDF_FORMAT, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import PDFfile from "@/components/budgets/PDFfile";
import { Loader } from "@/components/layout";
import { useBudgetTotals } from "@/hooks";
import { useEffect, useMemo, useState } from "react";
import { Header, Segment } from "semantic-ui-react";
import styled from "styled-components";

const REQUEST_STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  NOT_FOUND: "not-found",
  ERROR: "error",
};

const PublicBudgetContainer = styled.div`
  width: min(960px, calc(100vw - 32px));
  margin: 32px auto;
`;

const PublicBudgetLoaderContainer = styled.div`
  width: min(960px, calc(100vw - 32px));
  min-height: 60vh;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PublicBudgetMessage = ({ children }) => (
  <PublicBudgetContainer>
    <Segment placeholder>
      <Header as="h3" textAlign="center">
        {children}
      </Header>
    </Segment>
  </PublicBudgetContainer>
);

const PublicBudgetPage = ({ params }) => {
  const [status, setStatus] = useState(REQUEST_STATUS.LOADING);
  const [publicBudget, setPublicBudget] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchPublicBudget = async () => {
      setStatus(REQUEST_STATUS.LOADING);

      try {
        const response = await getPublicBudget({
          accountId: params?.accountId,
          publicHash: params?.publicHash,
        });

        if (!isActive) return;
        setPublicBudget(response);
        setStatus(REQUEST_STATUS.SUCCESS);
      } catch (error) {
        if (!isActive) return;
        setStatus(error?.status === 404 ? REQUEST_STATUS.NOT_FOUND : REQUEST_STATUS.ERROR);
      }
    };

    fetchPublicBudget();

    return () => {
      isActive = false;
    };
  }, [params?.accountId, params?.publicHash]);

  const budget = publicBudget?.budget;
  const selectedContact = useMemo(() => ({
    address: budget?.pickUpInStore
      ? PICK_UP_IN_STORE
      : budget?.customer?.addresses?.[0]?.address,
    phone: getFormatedPhone(budget?.customer?.phoneNumbers?.[0]),
  }), [budget]);

  const {
    subtotal,
    subtotalAfterDiscount,
    total,
  } = useBudgetTotals({
    products: budget?.products,
    globalDiscount: budget?.globalDiscount,
    additionalCharge: budget?.additionalCharge,
  });

  if (status === REQUEST_STATUS.LOADING) {
    return (
      <PublicBudgetLoaderContainer>
        <Loader active message="Cargando presupuesto" />
      </PublicBudgetLoaderContainer>
    );
  }

  if (status === REQUEST_STATUS.NOT_FOUND) {
    return <PublicBudgetMessage>No se encontró el presupuesto compartido o el enlace ya no es válido.</PublicBudgetMessage>;
  }

  if (status === REQUEST_STATUS.ERROR || !budget) {
    return <PublicBudgetMessage>No pudimos cargar el presupuesto en este momento.</PublicBudgetMessage>;
  }

  return (
    <PublicBudgetContainer>
      <Segment>
        <PDFfile
          budget={budget}
          account={publicBudget.account}
          printPdfMode={BUDGET_PDF_FORMAT.CUSTOMER.key}
          subtotal={subtotal}
          subtotalAfterDiscount={subtotalAfterDiscount}
          total={total}
          selectedContact={selectedContact}
          showPrices
          customPDFDisclaimer={publicBudget.defaultsPDF?.customPDFDisclaimer}
          hideSensitiveData
        />
      </Segment>
    </PublicBudgetContainer>
  );
};

export default PublicBudgetPage;
