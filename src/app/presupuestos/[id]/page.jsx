"use client";
import { useUserContext } from "@/User";
import { useGetBudget } from "@/api/budgets";
import { useListAllCustomers } from "@/api/customers";
import { useListAllProducts } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { PopupActions } from "@/components/common/buttons";
import { Button, Icon } from "@/components/common/custom";
import { ATTRIBUTES as CUSTOMERATTRIBUTES } from "@/components/customers/customers.common";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ATTRIBUTES as PRODUCTSATTRIBUTES } from "@/components/products/products.common";
import { APIS, BUDGET_PDF_FORMAT, BUDGET_STATES, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PrintButton = ({ onClick, color, iconName, text }) => (
  <Button
    onClick={onClick}
    color={color}
    size="tiny"
  >
    <Icon name={iconName} /> {text}
  </Button>
);

const SendButton = ({ href, color, iconName, text, target="_blank" }) => (
  <a href={href} target={target}>
    <Button width="100%" color={color} size="tiny">
      {iconName && <Icon name={iconName} />}{text}
    </Button>
  </a>
);

const Budget = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { userData } = useUserContext();
  const { data: budget, isLoading: loadingBudget } = useGetBudget(params.id);

  const { data: productsData, isLoading: loadingProducts } = useListAllProducts({
    attributes: [
      PRODUCTSATTRIBUTES.CODE,
      PRODUCTSATTRIBUTES.PRICE,
      PRODUCTSATTRIBUTES.NAME,
      PRODUCTSATTRIBUTES.COMMENTS,
      PRODUCTSATTRIBUTES.BRANDNAME,
      PRODUCTSATTRIBUTES.SUPPLIERNAME
    ],
    enabled: budget?.state === BUDGET_STATES.DRAFT.id
  });

  const { data: customersData, isLoading: loadingCustomers } = useListAllCustomers({
    attributes: [
      CUSTOMERATTRIBUTES.ADDRESS,
      CUSTOMERATTRIBUTES.PHONE,
      CUSTOMERATTRIBUTES.ID,
      CUSTOMERATTRIBUTES.NAME
    ],
    enabled: budget?.state === BUDGET_STATES.DRAFT.id
  });

  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { role } = useUserContext();
  const [printPdfMode, setPrintPdfMode] = useState(BUDGET_PDF_FORMAT.CLIENT);

  const { products } = useMemo(() => {
    return { products: productsData?.products }
  }, [productsData]);
  console.log("products", products)

  const { customers } = useMemo(() => {
    return { customers: customersData?.customers }
  }, [customersData]);
  console.log("customers", customers)

  const mappedProducts = useMemo(() => products?.map(product => ({
    ...product,
    key: product.code,
    value: product.name,
    text: product.name,
  })), [products]);

  const mappedCustomers = useMemo(() => customers?.map(customer => ({
    ...customer,
    key: customer.name,
    value: customer.name,
    text: customer.name,
  })), [customers]);

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (budget) {
      const stateTitle = BUDGET_STATES[budget.state]?.title || "No definido";
      setLabels([PAGES.BUDGETS.NAME, budget.id, stateTitle]);
    }
  }, [setLabels, budget]);

  useEffect(() => {
    if (budget) {
      const printButtons = [
        {
          mode: BUDGET_PDF_FORMAT.DISPATCH,
          color: 'green',
          iconName: 'truck',
          text: 'Remito'
        },
        {
          mode: BUDGET_PDF_FORMAT.CLIENT,
          color: 'green',
          iconName: 'address card',
          text: 'Cliente'
        },
        {
          mode: BUDGET_PDF_FORMAT.INTERNAL,
          color: 'green',
          iconName: 'archive',
          text: 'Interno'
        }
      ];

      const sendButtons = [
        ...(budget?.customer?.phoneNumbers?.length ? [{
          buttons: budget?.customer?.phoneNumbers.map(({ ref, areaCode, number }) => (
            <SendButton
              key={`${APIS.WSP(`${areaCode}${number}`)}`}
              href={`${APIS.WSP(`${areaCode}${number}`, budget?.customer?.name)}`}
              text={`${ref ? `${ref} - ` : ''}${areaCode} ${number}`}
            />
          )),
          color: 'green',
          iconName: 'whatsapp',
          text: 'WhatsApp'
        }] : []),
        ...(budget?.customer?.emails?.length ? [{
          buttons: budget?.customer?.emails?.map(({ ref, email }) => (
            <SendButton
              key={`${APIS.MAIL(budget?.customer?.email, budget?.customer?.name)}`}
              href={`${APIS.MAIL(budget?.customer?.email, budget?.customer?.name)}`}
              text={`${ref ? `${ref} - ` : ''}${email}`}
            />
          )),
          color: 'red',
          iconName: 'mail',
          text: 'Mail'
        }] : [])
      ];

      const actions = [
        {
          id: 1,
          button: <PopupActions title="PDFs" icon="download" color="blue"
            buttons={
              printButtons.map(({ mode, color, iconName, text }) => (
                <PrintButton
                  key={mode}
                  onClick={() => {
                    setPrintPdfMode(mode);
                    setTimeout(window.print);
                  }}
                  color={color}
                  iconName={iconName}
                  text={text}
                />
              ))
            }
          />
        },
        {
          id: 2,
          button: <PopupActions title="Enviar" icon="send" color="blue"
            buttons={
              [...sendButtons.map(({ href, color, iconName, text, buttons }) => (
                <PopupActions
                  animated={false}
                  key={iconName}
                  href={href}
                  color={color}
                  iconName={iconName}
                  title={text}
                  buttons={buttons}
                  position="right center"
                />
              ))]
            }
          />
        },
        {
          id: 3,
          icon: 'copy',
          color: 'green',
          onClick: () => { push(PAGES.BUDGETS.CLONE(budget.id)) },
          text: 'Clonar'
        },
      ];
      setActions(actions);
    }
  }, [budget, push, role, setActions]);

  if (!loadingBudget && !budget) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <Loader active={loadingProducts || loadingCustomers || loadingBudget}>
      <BudgetForm
        readonly={budget?.state.toUpperCase() !== BUDGET_STATES.DRAFT.id}
        user={userData}
        budget={budget}
        products={mappedProducts}
        customers={mappedCustomers}
        printPdfMode={printPdfMode}
      />
    </Loader>
  );
};

export default Budget;
