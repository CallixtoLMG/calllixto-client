import ShowBudget from "@/components/budgets/ShowBudget";

async function loadBudget(id) {
  const res = await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/budgets/${id}`, { cache: "no-store" });
  const data = await res.json();
  return data;
};

async function Customer({ params }) {

  const budget = await loadBudget(params.id);

  return (
    <ShowBudget budget={budget} id={params.id} />
  )
};

export default Customer;