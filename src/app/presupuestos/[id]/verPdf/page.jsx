import PDFfile from "@/components/PDFfile";
import { PAGES } from "@/constants";
import { CLIENTID, PATHS, URL } from "@/fetchUrls";
import { useRouter } from "next/navigation";

async function loadBudget(id) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.BUDGETS}/${id}`, { cache: "no-store" });
  const data = await res.json();
  return data;
};

async function VerPdf({ params }) {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
  }, []);

  const budget = await loadBudget(params.id);

  return (
    <PDFfile budget={budget.budget} />
  )
};


export default VerPdf;