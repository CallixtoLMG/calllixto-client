"use client";
import { useUserContext } from "@/User";
import { useCancelBudget, useConfirmBudget, useEditBudget, useGetBudget } from "@/api/budgets";
import { useListCustomers } from "@/api/customers";
import { useGetPayment } from "@/api/payments";
import { useListProducts } from "@/api/products";
import { IconedButton } from "@/common/components/buttons";
import { DropdownItem, DropdownMenu, DropdownOption, Flex, Icon, Menu } from "@/common/components/custom";
import ModalCancel from "@/common/components/modals/ModalCancel";
import { COLORS, ENTITIES, EXTERNAL_APIS, ICONS, PAGES } from "@/common/constants";
import { getFormatedPhone } from "@/common/utils";
import { now } from "@/common/utils/dates";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetView from "@/components/budgets/BudgetView";
import ModalConfirmation from "@/components/budgets/ModalConfirmation";
import ModalCustomer from "@/components/budgets/ModalCustomer";
import ModalPDF from "@/components/budgets/ModalPDF";
import { BUDGET_STATES, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import { getSubtotal, getTotalSum, isBudgetCancelled, isBudgetDraft, isBudgetExpired, isBudgetPending } from "@/components/budgets/budgets.utils";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
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
  const { data: payment, refetch: refetchPayment } = useGetPayment(ENTITIES.BUDGET, params.id);
  const [customerData, setCustomerData] = useState();
  const [isModalCustomerOpen, setIsModalCustomerOpen] = useState(false);
  const [isModalConfirmationOpen, setIsModalConfirmationOpen] = useState(false);
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);
  const [isModalPDFOpen, setIsModalPDFOpen] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [subtotalAfterDiscount, setSubtotalAfterDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedContact, setSelectedContact] = useState({ phone: '', address: '' });
  const customerHasInfo = useMemo(() => !!customerData?.addresses?.length && !!customerData?.phoneNumbers?.length, [customerData]);
  const editBudget = useEditBudget();
  const confirmBudget = useConfirmBudget();
  const cancelBudget = useCancelBudget();

  const customers = useMemo(() => customersData?.customers?.map(customer => ({
    ...customer,
    key: customer.name,
    value: customer.name,
    text: customer.name,
  })), [customersData]);

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
        address: budget.pickUpInStore
          ? PICK_UP_IN_STORE
          : budget.customer?.addresses?.[0]?.address,
        phone: getFormatedPhone(budget.customer?.phoneNumbers?.[0])
      });
    }
  }, [setLabels, budget, push, isLoading]);

  useEffect(() => {
    if (budget) {
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
          icon: ICONS.DOWNLOAD,
          color: COLORS.BLUE,
          onClick: () => setIsModalPDFOpen(true),
          text: 'PDF'
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
      {(isBudgetPending(budget?.state) || isBudgetExpired(budget?.state)) && (
        <Flex
          $margin={(isBudgetDraft(budget?.state) || isBudgetCancelled(budget?.state)) ? "0" : undefined}
          $justifyContent="space-between"
        >
          <IconedButton
            text="Confirmar"
            icon={ICONS.CHECK}
            color={COLORS.GREEN}
            onClick={handleConfirm}
          />
        </Flex>
      )}
      {isBudgetDraft(budget?.state) ? (
        <BudgetForm
          onSubmit={mutateEdit}
          products={productsData?.products ?? []}
          customers={customers}
          user={userData}
          budget={budget}
          isLoading={isPendingEdit}
          draft
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
        />
      ) : (
        <BudgetView
          budget={{ ...budget, customer: customerData }}
          subtotal={subtotal}
          subtotalAfterDiscount={subtotalAfterDiscount}
          total={total}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          payment={payment}
          refetchPayment={refetchPayment}
        />
      )}
      <ModalPDF
        isModalOpen={isModalPDFOpen}
        onClose={setIsModalPDFOpen}
        budget={budget}
        client={userData?.client}
        total={total}
        subtotal={subtotal}
        selectedContact={selectedContact}
        subtotalAfterDiscount={subtotalAfterDiscount}
      />
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
      <ModalCancel
        isModalOpen={isModalCancelOpen}
        onClose={handleModalCancelClose}
        onConfirm={mutateCancel}
        isLoading={isPendingCancel}
        id={budget?.id}
        header={`Desea anular el presupuesto ${budget?.id}?`}
      />
    </Loader>
  );
};

export default Budget;
