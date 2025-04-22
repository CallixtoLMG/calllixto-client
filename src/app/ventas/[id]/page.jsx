"use client";
import { useUserContext } from "@/User";
import { useCancelBudget, useConfirmBudget, useEditBudget, useGetBudget } from "@/api/budgets";
import { useListCustomers } from "@/api/customers";
import { useDolarExangeRate } from "@/api/external";
import { useListProducts } from "@/api/products";
import { IconedButton } from "@/common/components/buttons";
import { Box, Button, DropdownItem, DropdownMenu, DropdownOption, Flex, Icon, Input, Menu } from "@/common/components/custom";
import { COLORS, EXTERNAL_APIS, ICONS, PAGES } from "@/common/constants";
import { getFormatedPhone } from "@/common/utils";
import { now } from "@/common/utils/dates";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetView from "@/components/budgets/BudgetView";
import ModalCancel from "@/components/budgets/ModalCancelBudget";
import ModalConfirmation from "@/components/budgets/ModalConfirmation";
import ModalCustomer from "@/components/budgets/ModalCustomer";
import PDFfile from "@/components/budgets/PDFfile";
import { BUDGET_PDF_FORMAT, BUDGET_STATES } from "@/components/budgets/budgets.constants";
import { getSubtotal, getTotalSum, isBudgetCancelled, isBudgetDraft, isBudgetExpired, isBudgetPending } from "@/components/budgets/budgets.utils";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Dropdown } from "semantic-ui-react";
import { v4 as uuid } from 'uuid';

const Budget = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { userData } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { push } = useRouter();
  const { data: budget, isLoading } = useGetBudget(params.id);
  const { data: productsData, isLoading: loadingProducts } = useListProducts();
  const { data: customersData, isLoading: loadingCustomers } = useListCustomers();
  const [showDolarExangeRate, setShowDolarExangeRate] = useState(false);
  const { data: dolar } = useDolarExangeRate({ enabled: showDolarExangeRate });
  const [printPdfMode, setPrintPdfMode] = useState(BUDGET_PDF_FORMAT.CLIENT);
  const [customerData, setCustomerData] = useState();
  const [isModalCustomerOpen, setIsModalCustomerOpen] = useState(false);
  const [isModalConfirmationOpen, setIsModalConfirmationOpen] = useState(false);
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);
  const [dolarRate, setDolarRate] = useState(dolar);
  const [formattedDolarRate, setFormattedDolarRate] = useState('');
  const [initialDolarRateSet, setInitialDolarRateSet] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [subtotalAfterDiscount, setSubtotalAfterDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedContact, setSelectedContact] = useState({ phone: '', address: '' });
  const customerHasInfo = useMemo(() => !!customerData?.addresses?.length && !!customerData?.phoneNumbers?.length, [customerData]);
  const printRef = useRef();
  const editBudget = useEditBudget();
  const confirmBudget = useConfirmBudget();
  const cancelBudget = useCancelBudget();

  useEffect(() => {
    if (dolar && showDolarExangeRate && !initialDolarRateSet) {
      setDolarRate(dolar);
      setFormattedDolarRate(formatValue(dolar));
      setInitialDolarRateSet(true);
    }
    if (!showDolarExangeRate) {
      setInitialDolarRateSet(false);
    }
  }, [dolar, showDolarExangeRate, initialDolarRateSet]);

  const formatValue = (value) => {
    const formattedValue = value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formattedValue?.includes('.') ? formattedValue.split('.').slice(0, 2).join('.') : formattedValue;
  };

  const handleDollarChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    } else {
      value = parts[0];
    }
    const numericValue = parseFloat(value.replace(/,/g, ''));

    setFormattedDolarRate(value);
    setDolarRate(numericValue);
  };

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
      budget.products = budget.products.map((product) => ({
        ...product, key: uuid(),
      }))
      const calculatedSubtotal = getTotalSum(budget.products);
      const calculatedSubtotalAfterDiscount = getSubtotal(calculatedSubtotal, -budget.globalDiscount);
      const calculatedFinalTotal = getSubtotal(calculatedSubtotalAfterDiscount, budget.additionalCharge);

      setSubtotal(calculatedSubtotal);
      setSubtotalAfterDiscount(calculatedSubtotalAfterDiscount);
      setTotal(calculatedFinalTotal);
      const stateTitle = BUDGET_STATES[budget.state]?.singularTitle || BUDGET_STATES.INACTIVE.singularTitle;
      const stateColor = BUDGET_STATES[budget.state]?.color || BUDGET_STATES.INACTIVE.color;
      setLabels([
        PAGES.BUDGETS.NAME,
        budget.id ? { id: budget.id, title: stateTitle, color: stateColor } : null
      ].filter(Boolean));
      setCustomerData(budget.customer);
      setSelectedContact({
        address: budget.customer?.addresses?.[0]?.address,
        phone: getFormatedPhone(budget.customer?.phoneNumbers?.[0])
      });
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
          color: COLORS.BLUE,
          iconName: ICONS.TRUCK,
          text: 'Remito',
        },
        {
          mode: BUDGET_PDF_FORMAT.CLIENT,
          color: COLORS.BLUE,
          iconName: ICONS.ADDRESS_CARD,
          text: 'Cliente',
        },
        {
          mode: BUDGET_PDF_FORMAT.INTERNAL,
          color: COLORS.BLUE,
          iconName: ICONS.ARCHIVE,
          text: 'Interno'
        }
      ];

      const sendButtons = [
        {
          text: 'WhatsApp',
          iconName: 'whatsapp',
          color: COLORS.GREEN,
          subOptions: budget?.customer?.phoneNumbers?.map(({ ref, areaCode, number }) => ({
            key: `${EXTERNAL_APIS.WSP(`${areaCode}${number}`)}`,
            href: `${EXTERNAL_APIS.WSP(`${areaCode}${number}`, budget?.customer?.name)}`,
            text: `${ref ? `${ref} - ` : ''}${areaCode} ${number}`,
            iconName: 'whatsapp',
            color: COLORS.GREEN,
          })) || []
        },
        {
          text: 'Mail',
          iconName: 'mail',
          color: COLORS.RED,
          subOptions: budget?.customer?.emails?.map(({ ref, email }) => ({
            key: `${EXTERNAL_APIS.MAIL(email, budget?.customer?.name)}`,
            href: `${EXTERNAL_APIS.MAIL(email, budget?.customer?.name)}`,
            text: `${ref ? `${ref} - ` : ''}${email}`,
            iconName: 'mail',
            color: COLORS.RED,
          })) || []
        }
      ];

      const hasValidSendOptions = sendButtons.some(button => button.subOptions.length > 0);

      const actions = [
        !isBudgetDraft(budget.state) && 
        {
          id: 1,
          button: (
            <Dropdown
              pointing
              as={Button}
              text='PDFs'
              icon={ICONS.DOWNLOAD}
              floating
              labeled
              button
              className='icon blue'
            >
              <Dropdown.Menu>
                {printButtons.map(({ mode, iconName, text, color }) => (
                  <DropdownItem
                    key={mode}
                    onClick={() => {
                      setPrintPdfMode(mode);
                      setTimeout(handlePrint);
                    }}
                  >
                    <Icon color={color} name={iconName} /> {text}
                  </DropdownItem>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )
        },
        hasValidSendOptions && {
          id: 2,
          button: (
            <Menu>
              <DropdownOption
                $menu={true}
                pointing
                text='Enviar'
                icon={ICONS.SEND}
                floating
                labeled
                button
                className='icon blue'
                $paddingLeft="45px">
                <Dropdown.Menu>
                  {sendButtons.map(({ text, iconName, subOptions }) => (
                    <Flex key={iconName}>
                      {subOptions.length > 0 && (
                        <DropdownOption text={text} pointing="left" className="link item">
                          <DropdownMenu icon={iconName}>
                            {subOptions.map(({ key, href, text, iconName, color }) => (
                              <Flex key={key}>
                                <DropdownItem key={key} as='a' href={href} target="_blank">
                                  <Icon name={iconName} color={color} /> {text}
                                </DropdownItem>
                              </Flex>
                            ))}
                          </DropdownMenu>
                        </DropdownOption>
                      )}
                    </Flex>
                  ))}
                </Dropdown.Menu>
              </DropdownOption>
            </Menu>
          )
        },
        {
          id: 3,
          icon: ICONS.COPY,
          color: COLORS.GREEN,
          onClick: () => { push(PAGES.BUDGETS.CLONE(budget.id)) },
          text: 'Clonar'
        },
        budget.state === BUDGET_STATES.CONFIRMED.id && {
          id: 4,
          icon: ICONS.BAN,
          color: COLORS.RED,
          onClick: () => setIsModalCancelOpen(true),
          text: 'Anular',
          basic: true
        },
      ].filter(Boolean);
      setActions(actions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, push, role, setActions]);

  const handleConfirm = () => {
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
    mutationFn: (dataToSend) => {
      const { pickUpInStore, paymentsMade, total } = dataToSend;
      const confirmationData = {
        confirmedBy: `${userData.name}`,
        confirmedAt: now(),
        pickUpInStore,
        paymentsMade,
        total
      };
      return confirmBudget(confirmationData, budget?.id);
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Presupuesto confirmado!');
        setIsModalConfirmationOpen(false);
      } else {
        toast.error(response.error.message);
      }
    },
  });

  const { mutate: mutateCancel, isPending: isPendingCancel } = useMutation({
    mutationFn: (cancelReason) => {
      const cancelData = {
        cancelledBy: `${userData.name}`,
        cancelledAt: now(),
        cancelledMsg: cancelReason
      };
      return cancelBudget({ cancelData, id: budget?.id });
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Presupuesto anulado!');
        setIsModalCancelOpen(false);
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(`Error al anular: ${error.message}`);
    }
  });

  const { mutate: mutateEdit, isPending: isPendingEdit } = useMutation({
    mutationFn: (budget) => editBudget({ ...budget, id: params.id }),
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Presupuesto actualizado!');
      } else {
        toast.error(response.error.message);
      }
    },
  });

  return (
    <Loader active={isLoading || loadingProducts || loadingCustomers}>
      <Flex $margin={isBudgetDraft(budget?.state) || isBudgetCancelled(budget?.state) && "0"} $justifyContent="space-between">
        {(isBudgetPending(budget?.state) || isBudgetExpired(budget?.state)) ? (
          <>
            <IconedButton text="Confirmar" icon={ICONS.CHECK} color={COLORS.GREEN} onClick={handleConfirm} />
            <ModalCustomer
              isModalOpen={isModalCustomerOpen}
              onClose={handleModalCustomerClose}
              customer={customerData}
            />
            <ModalConfirmation
              subtotal={subtotal}
              subtotalAfterDiscount={subtotalAfterDiscount}
              total={total}
              isModalOpen={isModalConfirmationOpen}
              onClose={handleModalConfirmationClose}
              customer={customerData}
              onConfirm={mutate}
              isLoading={isPending}
              pickUpInStore={budget?.pickUpInStore}
            />
          </>
        ) : <Box />}
        {!isBudgetDraft(budget?.state) && !isBudgetCancelled(budget?.state) && (
          <Input
            type="text"
            height="35px"
            width="fit-content"
            onChange={handleDollarChange}
            actionPosition='left'
            placeholder="Precio"
            value={formattedDolarRate}
            disabled={!showDolarExangeRate}
            action={
              <IconedButton
                text="Cotizar en USD"
                icon={ICONS.DOLLAR}
                color={COLORS.GREEN}
                basic={!showDolarExangeRate}
                onClick={() => {
                  setShowDolarExangeRate(prev => !prev);
                  if (!showDolarExangeRate) {
                    setFormattedDolarRate(formatValue(dolarRate));
                  } else {
                    setFormattedDolarRate('');
                    setDolarRate(0);
                  }
                }}
              />
            }
          />
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
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
        />
      ) : (
        <>
          <BudgetView
            budget={{ ...budget, customer: customerData }}
            subtotal={subtotal}
            subtotalAfterDiscount={subtotalAfterDiscount}
            total={total}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
          />
          <ModalCancel
            isModalOpen={isModalCancelOpen}
            onClose={handleModalCancelClose}
            onConfirm={mutateCancel}
            isLoading={isPendingCancel}
            id={budget?.id}
          />
        </>
      )}
      <OnlyPrint marginTop="20px">
        <PDFfile
          ref={printRef}
          budget={budget}
          client={userData?.client}
          id={userData.client?.id}
          printPdfMode={printPdfMode}
          dolarExchangeRate={showDolarExangeRate && dolarRate}
          subtotal={subtotal}
          subtotalAfterDiscount={subtotalAfterDiscount}
          total={total}
          selectedContact={selectedContact}
        />
      </OnlyPrint>
    </Loader>
  );
};

export default Budget;
