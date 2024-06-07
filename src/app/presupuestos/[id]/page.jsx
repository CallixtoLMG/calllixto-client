"use client";
import { useUserContext } from "@/User";
import { useGetBudget } from "@/api/budgets";
import BudgetForm from "@/components/budgets/BudgetForm";
import { BreadcrumActions } from "@/components/common/buttons";
import { Button, Icon } from "@/components/common/custom";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { APIS, BUDGET_PDF_FORMAT, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      const visibilityRules = Rules(role);
      const actions = visibilityRules.canSeeButtons ? [
        {
          id: 1,
          button: <BreadcrumActions title="PDFs" icon="download" color="blue"
            button={
              <>
                <Button
                  onClick={() => {
                    setPrintPdfMode(BUDGET_PDF_FORMAT.DISPATCH)
                    setTimeout(window.print)
                  }}
                  color='green' size="tiny"><Icon name='truck' />Remito
                </Button>
                <Button
                  onClick={() => {
                    setPrintPdfMode(BUDGET_PDF_FORMAT.CLIENT)
                    setTimeout(window.print)
                  }}
                  color='green' size="tiny"><Icon name='address card' />Cliente
                </Button>
                <Button
                  onClick={() => {
                    setPrintPdfMode(BUDGET_PDF_FORMAT.INTERNAL)
                    setTimeout(window.print)
                  }}
                  color='green' size="tiny"><Icon name='archive' />Interno
                </Button>
              </>
            }
          />
        },
        {
          id: 2,
          button: <BreadcrumActions title="Enviar" icon="send" color="blue"
            button={
              <>
                <a href={`${APIS.WSP((`${budget?.customer?.phoneNumbers[0]?.areaCode}${budget?.customer?.phoneNumbers[0]?.number}`), budget?.customer?.name)}`} target="_blank">
                  <Button width="100%" color='green' size="tiny"><Icon name='whatsapp' />WhatsApp</Button>
                </a>
                <a href={`${APIS.MAIL(budget?.customer?.email, budget?.customer?.name)}`} target="_blank">
                  <Button width="100%" color='red' size="tiny"><Icon name='mail' />Mail</Button>
                </a>
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
      ] : [];
      setActions(actions);
    }
  }, [budget, push, role, setActions]);

  if (!isLoading && !budget) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <Loader active={isLoading}>
      <BudgetForm readonly user={userData} budget={budget} printPdfMode={printPdfMode} />
    </Loader>
  );
};

export default Budget;
