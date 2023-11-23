import ShowBudget from "@/components/budgets/ShowBudget";
import { CLIENTID, PATHS, URL } from "@/fetchUrls";

async function loadBudget(id) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.BUDGETS}/${id}`, { cache: "no-store" });
  const data = await res.json();
  return data;
};

async function Budgets({ params }) {

  const budget = await loadBudget(params.id);

  return (
    <ShowBudget budget={budget.budget} id={params.id} />
  )
};

export default Budgets;
