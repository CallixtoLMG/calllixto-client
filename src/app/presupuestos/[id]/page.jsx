"use client";
import { useUserContext } from "@/User";
import { GET_BUDGET_QUERY_KEY, LIST_BUDGETS_QUERY_KEY, confirmBudget, edit, useGetBudget } from "@/api/budgets";
import { useListAllCustomers } from "@/api/customers";
import { useListAllProducts } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetView from "@/components/budgets/BudgetView";
import ModalConfirmation from "@/components/budgets/ModalConfirmation";
import ModalCustomer from "@/components/budgets/ModalCustomer";
import { PopupActions } from "@/components/common/buttons";
import { Button, Checkbox, Icon } from "@/components/common/custom";
import { ATTRIBUTES as CUSTOMERS_ATTRIBUTES } from "@/components/customers/customers.common";
import { Loader, NoPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ATTRIBUTES as PRODUCT_ATTRIBUTES } from "@/components/products/products.common";
import { APIS, BUDGET_PDF_FORMAT, BUDGET_STATES, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { now } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Box } from "rebass";

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
    enabled: budget?.state.toUpperCase() === BUDGET_STATES.DRAFT.id
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
  const [printPdfMode, setPrintPdfMode] = useState(BUDGET_PDF_FORMAT.CLIENT);
  const [customerData, setCustomerData] = useState();
  const customerHasInfo = useMemo(() => !!customerData?.addresses?.length && !!customerData?.phoneNumbers?.length, [customerData]);
  const [isModalCustomerOpen, setIsModalCustomerOpen] = useState(false);
  const [isModalConfirmationOpen, setIsModalConfirmationOpen] = useState(false);
  const [confirmed, setConfirmed] = useState();

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
      setConfirmed(budget.state === BUDGET_STATES.CONFIRMED.id);
    }
  }, [setLabels, budget, push, isLoading]);
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

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const confirmationData = {
        confirmedBy: `${userData.firstName} ${userData.lastName}`,
        confirmedAt: now(),
        confirmed: true,
        state: BUDGET_STATES.CONFIRMED.id
      };
      const { data } = await confirmBudget(confirmationData, budget?.id);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BUDGETS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [GET_BUDGET_QUERY_KEY, budget?.id] });
        toast.success('Presupuesto confirmado!');
        setConfirmed(true);
        setIsModalConfirmationOpen(false);
        push(PAGES.BUDGETS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  const { mutate: mutateEdit, isPending: isPendingEdit } = useMutation({
    mutationFn: async (budget) => {
      console.log("budget", { ...budget, id: params.id, })

      const { data } = await edit({ ...budget, id: params.id });
      console.log(data)
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
    <Loader active={isLoading}>
      {!budget?.confirmed && budget?.state !== BUDGET_STATES.DRAFT.id && (
        <NoPrint>
          <Box marginBottom={15}>
            <Checkbox
              toggle
              checked={confirmed}
              onChange={handleCheckboxChange}
              label={confirmed ? "Confirmado" : "Confirmar presupuesto"}
              disabled={budget?.state === BUDGET_STATES.CONFIRMED.id || budget?.state === BUDGET_STATES.INACTIVE.id}
              customColors={{
                false: 'orange',
                true: 'green'
              }}
            />
          </Box>
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
        </NoPrint>
      )}
      {budget?.state === BUDGET_STATES.DRAFT.id ?
        (<BudgetForm
          onSubmit={mutateEdit}
          products={products}
          customers={customers}
          user={userData}
          budget={budget}
          isLoading={isPendingEdit}
          draft
          printPdfMode={printPdfMode}
        />) :
        (<BudgetView budget={{ ...budget, customer: customerData }} user={userData} printPdfMode={printPdfMode} />)
      }
    </Loader>
  );
};

export default Budget;
