"use client";
import { useUserContext } from "@/User";
import { useCancelBudget, useConfirmBudget } from "@/api/budgets";
import { useGetPayments } from "@/api/payments";
import { useGetSetting } from "@/api/settings";
import { IconedButton } from "@/common/components/buttons";
import { Flex, Message, MessageHeader } from "@/common/components/custom";
import ModalCancel from "@/common/components/modals/ModalCancel";
import { COLORS, CONTENT_SIZES, ENTITIES, EXTERNAL_APIS, ICONS, PAGES } from "@/common/constants";
import { getFormatedPhone } from "@/common/utils";
import { now } from "@/common/utils/dates";
import BudgetView from "@/components/budgets/BudgetView";
import ModalConfirmation from "@/components/budgets/ModalConfirmation";
import ModalCustomer from "@/components/budgets/ModalCustomer";
import ModalPDF from "@/components/budgets/ModalPDF";
import { BUDGET_STATES, PAYMENTS_TAB_INDEX, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import { isBudgetCancelled, isBudgetDraft, isBudgetExpired, isBudgetPending } from "@/components/budgets/budgets.utils";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useBudgetTotals, useLazyTabs } from "@/hooks";
import { getSelectedAccountId } from "@/services/session";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { v4 as uuid } from 'uuid';

const BudgetPageClient = ({ budget }) => {
  const { role } = useUserContext();
  const { userData } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { push, refresh } = useRouter();
  const {
    activeIndex,
    onTabChange,
    hasVisited,
  } = useLazyTabs({
    initialIndex: 0,
    lazyIndexes: PAYMENTS_TAB_INDEX !== null ? [PAYMENTS_TAB_INDEX] : [],
  });

  const { data: paymentsMade, isLoading: isLoadingPayments, refetch: refetchPayments } = useGetPayments(ENTITIES.BUDGET, budget.id, {
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
  const accountId = useMemo(() => getSelectedAccountId(userData), [userData]);
  const publicHash = budget?.publicHash;
  const isPublicBudgetsEnabled = Boolean(budgetSettings?.publicEnabled);
  const publicLinkTooltip = !isPublicBudgetsEnabled
    ? "Los presupuestos públicos están deshabilitados en Configuración"
    : !publicHash
      ? "Este presupuesto no tiene un enlace público disponible"
      : !accountId
        ? "No se pudo identificar la cuenta actual"
        : undefined;
  const canCopyPublicLink = Boolean(isPublicBudgetsEnabled && accountId && publicHash);

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
  }, [setLabels, budget]);

  const handleCopyPublicLink = useCallback(async () => {
    if (!canCopyPublicLink) {
      toast.error(publicLinkTooltip);
      return;
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard no disponible");
      }

      await navigator.clipboard.writeText(`${window.location.origin}${PAGES.PUBLIC.BUDGETS.SHOW(accountId, publicHash)}`);
      toast.success("enlace público copiado.");
    } catch (error) {
      console.error("Error copiando enlace público:", error);
      toast.error("No se pudo copiar el enlace público.");
    }
  }, [accountId, canCopyPublicLink, publicHash, publicLinkTooltip]);

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
      const sendItems = sendButtons.flatMap(({ text: channelText, subOptions }) =>
        subOptions.map(({ key, href, text, iconName, color }) => ({
          id: key,
          href,
          target: "_blank",
          text: `${channelText}: ${text}`,
          collapsedTooltip: `Enviar venta por ${channelText} a ${text}`,
          showTooltipWhenExpanded: true,
          icon: iconName,
          color,
        }))
      );

      const actions = [
        !isBudgetDraft(budget.state) &&
        {
          id: 1,
          icon: ICONS.PRINT,
          color: COLORS.BLUE,
          onClick: () => setIsModalPDFOpen(true),
          text: 'Descargar PDF de la venta',
          showTooltipWhenExpanded: true,
          iconOnly:true,
        },
        !isBudgetDraft(budget.state) &&
        {
          id: 2,
          icon: ICONS.CLIPBOARD,
          color: COLORS.BLUE,
          onClick: handleCopyPublicLink,
          text: 'Copiar link público',
          tooltip: publicLinkTooltip,
          disabled: !canCopyPublicLink,
          iconOnly:true,
        },
        hasValidSendOptions && {
          id: 3,
          icon: ICONS.SEND,
          color: COLORS.BLUE,
          text: 'Enviar',
          items: sendItems,
        },
        {
          id: 4,
          icon: ICONS.COPY,
          color: COLORS.GREEN,
          onClick: () => { push(PAGES.BUDGETS.CLONE(budget.id)) },
          text: 'Clonar venta',
          iconOnly:true,
        },
        budget.state === BUDGET_STATES.CONFIRMED.id && {
          id: 5,
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
  }, [budget, canCopyPublicLink, handleCopyPublicLink, publicLinkTooltip, push, role, setActions]);

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
        refresh();
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
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
        refresh();
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }
    },
    onError: (error) => {
      toast.error(`Error al anular: ${error.message}`);
    }
  });

  return (
    <Loader active={isLoadingBudgetSettings || isRefetchingSettings}>
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
            width={CONTENT_SIZES.FIT}
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
          refetch={refresh}
          isLoadingPayments={isLoadingPayments}
          refetchPayments={refetchPayments}
        />
      </FormProvider>
      <ModalPDF
        isModalOpen={isModalPDFOpen}
        onClose={setIsModalPDFOpen}
        budget={{ ...budget, paymentsMade }}
        account={userData?.selectedAccount ?? userData?.account}
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

export default BudgetPageClient;
