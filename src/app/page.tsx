import { PAGES } from "@/common/constants";
import { redirect } from "next/navigation";

export default function Home() {
  redirect(PAGES.BUDGETS.BASE);
}
