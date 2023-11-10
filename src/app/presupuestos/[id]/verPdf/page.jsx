import PDFfile from "@/components/PDFfile";

async function loadBudget(id) {
  const res = await fetch(`https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/budgets/${id}`, { cache: "no-store" });
  const data = await res.json();
  return data;
};

async function VerPdf({ params }) {

  const budget = await loadBudget(params.id);

  return (
    <PDFfile budget={budget.budget} />
  )
};


export default VerPdf;