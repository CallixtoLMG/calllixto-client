"use client";
import { useUserContext } from "@/User";
import { useGetBudget, edit } from "@/api/budgets";
import { BreadcrumActions } from "@/components/common/buttons";
import { Button, Checkbox, Icon } from "@/components/common/custom";
import { Loader, NoPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { APIS, BUDGET_PDF_FORMAT, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BudgetView from "@/components/budgets/BudgetView";
import ModalCustomer from "@/components/budgets/ModalCustomer";
import ModalConfirmation from "@/components/budgets/ModalConfirmation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box } from "rebass";
import { now } from "@/utils";
import toast from "react-hot-toast";

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
      <Icon name={iconName} /> {text}
    </Button>
  </a>
);

const Budget = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { userData } = useUserContext();
  const { data: budget, isLoading } = useGetBudget(params.id);
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
      setLabels([PAGES.BUDGETS.NAME, budget.id]);
      setCustomerData(budget.customer);
      setConfirmed(budget.state === 'CONFIRMED');
    }
  }, [setLabels, budget, isLoading, push]);

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
        {
          href: `${APIS.WSP(`${budget?.customer?.phoneNumbers[0]?.areaCode}${budget?.customer?.phoneNumbers[0]?.number}`, budget?.customer?.name)}`,
          color: 'green',
          iconName: 'whatsapp',
          text: 'WhatsApp'
        },
        {
          href: `${APIS.MAIL(budget?.customer?.email, budget?.customer?.name)}`,
          color: 'red',
          iconName: 'mail',
          text: 'Mail'
        }
      ];

      const actions = [
        {
          id: 1,
          button: <BreadcrumActions title="PDFs" icon="download" color="blue"
            button={
              <>
                {printButtons.map(({ mode, color, iconName, text }) => (
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
                ))}
              </>
            }
          />
        },
        {
          id: 2,
          button: <BreadcrumActions title="Enviar" icon="send" color="blue"
            button={
              <>
                {sendButtons.map(({ href, color, iconName, text }) => (
                  <SendButton
                    key={iconName}
                    href={href}
                    color={color}
                    iconName={iconName}
                    text={text}
                  />
                ))}
              </>
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
      const confirmationData = { confirmedBy: `${userData.firstName} ${userData.lastName}`, confirmedAt: now() };
      const { data } = await edit(confirmationData, budget?.id);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BUDGETS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [GET_BUDGET_QUERY_KEY, budget?.id] });
        toast.success('Presupuesto confirmado!');
        setConfirmed(true);
        setIsModalConfirmationOpen(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  return (
    <Loader active={isLoading}>
      <NoPrint>
        <Box marginBottom={15}>
          <Checkbox
            toggle
            checked={confirmed}
            onChange={handleCheckboxChange}
            label={confirmed ? "Confirmado" : "Confirmar presupuesto"}
            disabled={budget?.state === 'CONFIRMED'}
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
      <BudgetView budget={{ ...budget, customer: customerData }} user={userData} printPdfMode={printPdfMode} />
    </Loader>
  );
};

export default Budget;