import SeePDFfile from "@/components/SeePDFfile";

async function loadBudget(id) {
  const res = await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/budgets/${id}`, { cache: "no-store" });
  const data = await res.json();
  return data;
};

async function VerPdf({ params }) {

  const budget = await loadBudget(params.id);

  return (
    <SeePDFfile budget={budget.budget} />
  )
};


export default VerPdf;