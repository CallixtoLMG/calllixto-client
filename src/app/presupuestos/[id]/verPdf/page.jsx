import PDFfile from "@/components/PDFfile";
import { CLIENTID, PATHS, URL } from "@/fetchUrls";

async function loadBudget(id) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.BUDGETS}/${id}`, { cache: "no-store" });
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