"use client";
import { useUserContext } from "@/User";
import { useGetBudget } from "@/api/budgets";
import BudgetForm from "@/components/budgets/BudgetForm";
import { BreadcrumActions } from "@/components/common/buttons";
import { Button, Icon } from "@/components/common/custom";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { APIS, BUDGET_PDF_FORMAT, BUDGET_STATES, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [printPdfMode, setPrintPdfMode] = useState(BUDGET_PDF_FORMAT.CLIENT);

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (budget) {
      setLabels([PAGES.BUDGETS.NAME, budget.id]);
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

  if (!isLoading && !budget) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <Loader active={isLoading}>
      <BudgetForm
        readonly={!budget?.state === BUDGET_STATES.DRAFT.id}
        user={userData}
        budget={budget}
        printPdfMode={printPdfMode}
      />
    </Loader>
  );
};

export default Budget;