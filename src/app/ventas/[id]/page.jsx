"use client";
import { useUserContext } from "@/User";
import { useCancelBudget, useConfirmBudget, useGetBudget } from "@/api/budgets";
import { useGetPayments } from "@/api/payments";
import { useGetSetting } from "@/api/settings";
import { IconedButton } from "@/common/components/buttons";
import { DropdownItem, DropdownMenu, DropdownOption, Flex, Icon, Menu, Message, MessageHeader } from "@/common/components/custom";
import ModalCancel from "@/common/components/modals/ModalCancel";
import { COLORS, ENTITIES, EXTERNAL_APIS, ICONS, PAGES } from "@/common/constants";
import { getFormatedPhone } from "@/common/utils";
import { now } from "@/common/utils/dates";
import BudgetView from "@/components/budgets/BudgetView";
import ModalConfirmation from "@/components/budgets/ModalConfirmation";
import ModalCustomer from "@/components/budgets/ModalCustomer";
import ModalPDF from "@/components/budgets/ModalPDF";
import { BUDGET_STATES, PAYMENTS_TAB_INDEX, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import { isBudgetCancelled, isBudgetDraft, isBudgetExpired, isBudgetPending } from "@/components/budgets/budgets.utils";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useBudgetTotals, useLazyTabs, useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
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
  const { data: budget, isLoading, refetch: refetchBudget } = useGetBudget(params.id);
  const {
    activeIndex,
    onTabChange,
    hasVisited,
  } = useLazyTabs({
    initialIndex: 0,
    lazyIndexes: PAYMENTS_TAB_INDEX !== null ? [PAYMENTS_TAB_INDEX] : [],
  });

  const { data: paymentsMade, isLoading: isLoadingPayments, refetch: refetchPayments } = useGetPayments(ENTITIES.BUDGET, params.id, {
    enabled: hasVisited(PAYMENTS_TAB_INDEX),
  });
  const { data: budgetSettings, isLoading: isLoadingBudgetSettings, isRefetching: isRefetchingSettings } = useGetSetting(ENTITIES.BUDGET);
  const [customerData, setCustomerData] = useState();
  const [isModalCustomerOpen, setIsModalCustomerOpen] = useState(false);
  const [isModalConfirmationOpen, setIsModalConfirmationOpen] = useState(false);
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);
  const [isModalPDFOpen, setIsModalPDFOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState({ phone: '', address: '' });
  const customerHasInfo = useMemo(() => !!customerData?.addresses?.length && !!customerData?.phoneNumbers?.length, [customerData]);
  const confirmBudget = useConfirmBudget();
  const cancelBudget = useCancelBudget();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const methods = useForm({
    defaultValues: budget,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const watchProducts = useWatch({ control: methods.control, name: "products", });
  const watchGlobalDiscount = useWatch({ control: methods.control, name: "globalDiscount", });
  const watchAdditionalCharge = useWatch({ control: methods.control, name: "additionalCharge", });

  const { subtotal, subtotalAfterDiscount, total } = useBudgetTotals({
    products: watchProducts,
    globalDiscount: watchGlobalDiscount,
    additionalCharge: watchAdditionalCharge,
  });

  useEffect(() => {
    if (!budget) return;

    methods.reset({
      ...budget,
      products: budget.products.map(p => ({
        ...p,
        key: uuid(),
      })),
    });
  }, [budget, methods]);

  useEffect(() => {
    if (!isLoading && !budget) {
      push(PAGES.NOT_FOUND.BASE);
      return;
    }

    if (budget) {
      budget.products = budget.products.map((product) => ({
        ...product, key: uuid(),
      }))
      const stateTitle = BUDGET_STATES[budget.state]?.singularTitle || BUDGET_STATES.INACTIVE.singularTitle;
      const stateColor = BUDGET_STATES[budget.state]?.color || BUDGET_STATES.INACTIVE.color;
      setLabels([
        { name: PAGES.BUDGETS.NAME },
        { name: budget?.id, label: { title: stateTitle, color: stateColor } }
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
          icon: ICONS.FILE_PDF,
          color: COLORS.BLUE,
          onClick: () => setIsModalPDFOpen(true),
          text: 'Imprimir venta',
          iconOnly:true,
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
                $paddingLeft="45px"
                >
                <Dropdown.Menu direction="left" >
                  {sendButtons.map(({ text, iconName, subOptions }) => (
                    <Flex key={iconName}>
                      {subOptions.length > 0 && (
                        <DropdownOption $reverse direction="left" text={text} pointing="left" className="link item">
                          <DropdownMenu margin="0 10px 0 0" icon={iconName}>
                            {subOptions.map(({ key, href, text, iconName, color }) => (
                              <Flex key={key}>
                                <DropdownItem  key={key} as='a' href={href} target="_blank">
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
          text: 'Clonar venta',
          iconOnly:true,
        },
        budget.state === BUDGET_STATES.CONFIRMED.id && {
          id: 4,
          icon: ICONS.BAN,
          color: COLORS.RED,
          onClick: () => setIsModalCancelOpen(true),
          text: 'Anular venta',
          basic: true,
          iconOnly:true,
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

  return (
    <Loader active={isLoading || !budget || isLoadingBudgetSettings || isRefetchingSettings}>
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
            width="fit-content"
          />
        </Flex>
      )}
      {isBudgetCancelled(budget?.state) && (
        <Message negative>
          <MessageHeader>Motivo de anulación</MessageHeader>
          <p>{budget?.cancelledMsg}</p>
        </Message>
      )}
      <FormProvider {...methods}>
        <BudgetView
          budget={{ ...budget, customer: customerData }}
          paymentsMade={paymentsMade}
          activeIndex={activeIndex}
          onTabChange={onTabChange}
          subtotal={subtotal}
          subtotalAfterDiscount={subtotalAfterDiscount}
          total={total}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          refetch={refetchBudget}
          isLoadingPayments={isLoadingPayments}
          refetchPayments={refetchPayments}
        />
      </FormProvider>
      <ModalPDF
        isModalOpen={isModalPDFOpen}
        onClose={setIsModalPDFOpen}
        budget={{ ...budget, paymentsMade }}
        client={userData?.selectedClient ?? userData?.client}
        total={total}
        subtotal={subtotal}
        subtotalAfterDiscount={subtotalAfterDiscount}
        selectedContact={selectedContact}
        defaults={budgetSettings?.defaultsPDF}
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
    </Loader >
  );
};

export default Budget;
