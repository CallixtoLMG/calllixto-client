"use client";
import { useUserContext } from "@/User";
import { useGetBudget } from "@/api/budgets";
import BudgetForm from "@/components/budgets/BudgetForm";
import { BreadcrumActions } from "@/components/common/buttons";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { APIS, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Icon } from "semantic-ui-react";

const Budget = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { userData } = useUserContext();
  const { data: budget, isLoading } = useGetBudget(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { role } = useUserContext();
  const [dispatch, setDispatch] = useState("client");

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (budget) {
      setLabels(['Presupuestos', budget.id]);
    }
  }, [setLabels, budget]);

  useEffect(() => {
    if (budget) {
      const visibilityRules = Rules(role);
      const actions = visibilityRules.canSeeButtons ? [
        {
          id: 1,
          button: <BreadcrumActions title="Descargar" icon="download" color="blue"
            button={
              <>
                <Button
                  onClick={() => {
                    setDispatch("dispatch")
                    setTimeout(window.print)
                  }}
                  color='green' size="tiny"><Icon name='file alternate' />Dispatch
                </Button>
                <Button
                  onClick={() => {
                    setDispatch("client")
                    setTimeout(window.print)
                  }}
                  color='green' size="tiny"><Icon name='address card' />Cliente
                </Button>
                <Button
                  onClick={() => {
                    setDispatch("internal")
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
                <Button
                  href={`${APIS.WSP((`${budget?.customer?.phoneNumbers[0]?.areaCode}${budget?.customer?.phoneNumbers[0]?.number}`), budget?.customer?.name)}`}
                  color='green' size="tiny"><Icon name='whatsapp' />WhatsApp
                </Button>
                <Button
                  href={`${APIS.MAIL(budget?.customer?.email, budget?.customer?.name)}`}
                  color='red' size="tiny"><Icon name='mail' />Mail
                </Button>
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
      <BudgetForm readonly user={userData} budget={budget} dispatch={dispatch} />
    </Loader>
  );
};

export default Budget;
