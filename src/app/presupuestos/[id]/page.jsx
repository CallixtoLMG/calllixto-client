"use client";
import { useUserContext } from "@/User";
import { GET_BUDGET_QUERY_KEY, LIST_BUDGETS_QUERY_KEY, cancelBudget, confirmBudget, edit, useGetBudget } from "@/api/budgets";
import { useListAllCustomers } from "@/api/customers";
import { useDolarExangeRate } from "@/api/external";
import { useListAllProducts } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetView from "@/components/budgets/BudgetView";
import ModalCancel from "@/components/budgets/ModalCancelBudget";
import ModalConfirmation from "@/components/budgets/ModalConfirmation";
import ModalCustomer from "@/components/budgets/ModalCustomer";
import PDFfile from "@/components/budgets/PDFfile";
import { PopupActions } from "@/components/common/buttons";
import { Button, Checkbox, CurrencyFormatInput, Icon, Label } from "@/components/common/custom";
import { ATTRIBUTES as CUSTOMERS_ATTRIBUTES } from "@/components/customers/customers.common";
import { Loader, NoPrint, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ATTRIBUTES as PRODUCT_ATTRIBUTES } from "@/components/products/products.common";
import { APIS, BUDGET_PDF_FORMAT, BUDGET_STATES, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { isBudgetCancelled, isBudgetConfirmed, isBudgetDraft, isBudgetPending, now } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Flex, Box } from "rebass";
import { Container as SContainer, Input as SInput } from "semantic-ui-react";
import styled from "styled-components";

const PrintButton = ({ onClick, color, iconName, text }) => (
  <Button
    onClick={onClick}
    color={color}
    size="tiny"
  >
    <Icon name={iconName} /> {text}
  </Button>
);

const SendButton = ({ href, color, iconName, text, target = "_blank" }) => (
  <a href={href} target={target}>
    <Button width="100%" color={color} size="tiny">
      {iconName && <Icon name={iconName} />}{text}
    </Button>
  </a>
);

const CheckboxContainer = styled(SContainer)`
  &&&{
    display:flex!important;
    flex-direction:row!important;
    align-items: center!important;
    width: 100%!important;
    max-width: 350px!important;
    column-gap: 5px!important;
    margin:0!important;
  }
`;

const DolarContainer = styled(SContainer)`
  &&&{
    visibility: ${({ show }) => (show ? 'visible' : 'hidden')}!important;
    display:flex!important;
    width:fit-content;
    color:red!important;
    gap: 5px!important;
    margin:0!important;
  }
`;

const Input = styled(SInput)`
  margin: 0!important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  max-width: ${({ maxWidth }) => maxWidth && `200px!important;`};
  height: ${({ height = '50px' }) => height} !important;
  width: ${({ width = '100%' }) => `${width}!important`};
  display: flex!important;
  input{
    height: ${({ height }) => height || '50px'} !important;
    padding: 0 14px!important;
    text-align: ${({ center }) => (center ? 'center' : 'left')} !important;
  };
  div{
    line-height: 190%!important;
  }
`;

const Budget = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { userData } = useUserContext();
  const { data: budget, isLoading } = useGetBudget(params.id);
  const { data: productsData, isLoading: loadingProducts } = useListAllProducts({
    attributes: [
      PRODUCT_ATTRIBUTES.CODE,
      PRODUCT_ATTRIBUTES.PRICE,
      PRODUCT_ATTRIBUTES.NAME,
      PRODUCT_ATTRIBUTES.COMMENTS,
      PRODUCT_ATTRIBUTES.BRAND_NAME,
      PRODUCT_ATTRIBUTES.SUPPLIER_NAME
    ],
    enabled: isBudgetDraft(budget?.state)
  });
  const { data: customersData, isLoading: loadingCustomers } = useListAllCustomers({
    attributes: [
      CUSTOMERS_ATTRIBUTES.ADDRESSES,
      CUSTOMERS_ATTRIBUTES.PHONES,
      CUSTOMERS_ATTRIBUTES.ID,
      CUSTOMERS_ATTRIBUTES.NAME
    ],
    enabled: budget?.state === BUDGET_STATES.DRAFT.id
  });
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { role } = useUserContext();
  const queryClient = useQueryClient();
  const [showDolarExangeRate, setShowDolarExangeRate] = useState(false);
  const { data: dolar } = useDolarExangeRate({ enabled: showDolarExangeRate });
  const [printPdfMode, setPrintPdfMode] = useState(BUDGET_PDF_FORMAT.CLIENT);
  const [customerData, setCustomerData] = useState();
  const customerHasInfo = useMemo(() => !!customerData?.addresses?.length && !!customerData?.phoneNumbers?.length, [customerData]);
  const [isModalCustomerOpen, setIsModalCustomerOpen] = useState(false);
  const [isModalConfirmationOpen, setIsModalConfirmationOpen] = useState(false);
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);
  const [dolarRate, setDolarRate] = useState(dolar);
  const printRef = useRef();

  useEffect(() => {
    if (dolar && showDolarExangeRate) {
      setDolarRate(dolar);
    }
  }, [dolar, showDolarExangeRate]);

  const products = useMemo(() => productsData?.products?.map(product => ({
    ...product,
    key: product.code,
    value: product.name,
    text: product.name,
  })),
    [productsData]);

  const customers = useMemo(() => customersData?.customers?.map(customer => ({
    ...customer,
    key: customer.name,
    value: customer.name,
    text: customer.name,
  }))
    , [customersData]);

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading && !budget) {
      push(PAGES.NOT_FOUND.BASE);
      return;
    }
    if (budget) {
      const stateTitle = BUDGET_STATES[budget.state]?.title || BUDGET_STATES.INACTIVE.title;
      const stateColor = BUDGET_STATES[budget.state]?.color || BUDGET_STATES.INACTIVE.color;
      setLabels([
        PAGES.BUDGETS.NAME,
        budget.id ? { id: budget.id, title: stateTitle, color: stateColor } : null
      ].filter(Boolean));
      setCustomerData(budget.customer);
    }
  }, [setLabels, budget, push, isLoading]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

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
          button: (
            <PopupActions
              title="PDFs"
              icon="download"
              color="blue"
              buttons={
                printButtons.map(({ mode, color, iconName, text }) => (
                  <PrintButton
                    key={mode}
                    onClick={() => {
                      setPrintPdfMode(mode);
                      setTimeout(handlePrint);
                    }}
                    color={color}
                    iconName={iconName}
                    text={text}
                  />
                ))
              }
            />
          )
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
        budget.state === BUDGET_STATES.CONFIRMED.id && {
          id: 4,
          icon: 'ban',
          color: 'red',
          onClick: () => setIsModalCancelOpen(true),
          text: 'Anular'
        },
      ].filter(Boolean);
      setActions(actions);
    }
  }, [budget, push, role, setActions]);

  const handleCheckboxChange = () => {
    if (!customerHasInfo) {
      setIsModalCustomerOpen(true);
      return;
    }
    setIsModalConfirmationOpen(true);
  };

  const handleModalCustomerClose = (openNextModal, customer) => {
    setIsModalCustomerOpen(false);
    if (openNextModal) {
      setCustomerData(customer);
      setIsModalConfirmationOpen(true);
    }
  };

  const handleModalConfirmationClose = () => {
    setIsModalConfirmationOpen(false);
  };

  const handleModalCancelClose = () => {
    setIsModalCancelOpen(false);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const confirmationData = {
        confirmedBy: `${userData.firstName} ${userData.lastName}`,
        confirmedAt: now(),
      };
      const { data } = await confirmBudget(confirmationData, budget?.id);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BUDGETS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [GET_BUDGET_QUERY_KEY, budget?.id] });
        toast.success('Presupuesto confirmado!');
        setIsModalConfirmationOpen(false);
        push(PAGES.BUDGETS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  const { mutate: mutateCancel, isPending: isPendingCancel } = useMutation({
    mutationFn: async (cancelReason) => {
      const cancelData = {
        cancelledBy: `${userData.firstName} ${userData.lastName}`,
        cancelledAt: now(),
        cancelledMsg: cancelReason,
      };
      const { data } = await cancelBudget(cancelData, budget?.id);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BUDGETS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [GET_BUDGET_QUERY_KEY, budget?.id] });
        toast.success('Presupuesto anulado!');
        setIsModalCancelOpen(false);
        push(PAGES.BUDGETS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  const { mutate: mutateEdit, isPending: isPendingEdit } = useMutation({
    mutationFn: async (budget) => {
      const { data } = await edit({ ...budget, id: params.id });
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BUDGETS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [GET_BUDGET_QUERY_KEY, budget?.id] });
        toast.success('Presupuesto actualizado!');
        push(PAGES.BUDGETS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  return (
    <Loader active={isLoading || loadingProducts || loadingCustomers}>
      <NoPrint>
        <Flex justifyContent="space-between">
          {isBudgetPending(budget?.state) ? (
            <>
              <Checkbox
                center
                toggle
                checked={isBudgetConfirmed(budget?.state)}
                onChange={handleCheckboxChange}
                label={isBudgetConfirmed(budget?.state) ? "Confirmado" : "Confirmar presupuesto"}
                disabled={isBudgetConfirmed(budget?.state) || budget?.state === BUDGET_STATES.INACTIVE.id}
                customColors={{
                  false: 'orange',
                  true: 'green'
                }}
              />
              <ModalCustomer
                isModalOpen={isModalCustomerOpen}
                onClose={handleModalCustomerClose}
                customer={customerData}
              />
              <ModalConfirmation
                isModalOpen={isModalConfirmationOpen}
                onClose={handleModalConfirmationClose}
                customer={customerData}
                onConfirm={mutate}
                isLoading={isPending}
              />
            </>
          ) : <Box />}
          {!isBudgetDraft(budget?.state) && !isBudgetCancelled(budget?.state) && (
            <Flex mb="10px" height="30px" >
              <CheckboxContainer>
                <Checkbox
                  toggle
                  checked={showDolarExangeRate}
                  onChange={() => setShowDolarExangeRate(prev => !prev)}
                  label="Cotizar en dólares"
                />
                <DolarContainer show={showDolarExangeRate}>
                  <Label height="25px" width="fit-content">Cambio</Label>
                  <CurrencyFormatInput
                    height="25px"
                    displayType="input"
                    thousandSeparator={true}
                    decimalScale={2}
                    allowNegative={false}
                    width="80px"
                    prefix="$ "
                    customInput={Input}
                    onChange={(e) => setDolarRate(e.target.value)}
                    value={dolarRate}
                    placeholder="Precio"
                  />
                </DolarContainer>
              </CheckboxContainer>
            </Flex>
          )}
        </Flex>

        {isBudgetDraft(budget?.state) ? (
          <BudgetForm
            onSubmit={mutateEdit}
            products={products}
            customers={customers}
            user={userData}
            budget={budget}
            isLoading={isPendingEdit}
            draft
            printPdfMode={printPdfMode}
          />
        ) : (
          <>
            <BudgetView
              budget={{ ...budget, customer: customerData }}
            />
            <ModalCancel
              isModalOpen={isModalCancelOpen}
              onClose={handleModalCancelClose}
              onConfirm={mutateCancel}
              isLoading={isPendingCancel}
            />
          </>
        )}
      </NoPrint>
      <OnlyPrint>
        <PDFfile
          ref={printRef}
          budget={budget}
          client={userData}
          id={userData.client?.id}
          printPdfMode={printPdfMode}
          dolarExchangeRate={showDolarExangeRate && dolarRate}
        />
      </OnlyPrint>
    </Loader >
  );
};

export default Budget;
