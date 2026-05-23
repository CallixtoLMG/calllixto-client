import { PAGE_CONSTANTS } from "@/common/constants/pages";
import { redirect } from "next/navigation";

export default function Home() {
  redirect(PAGE_CONSTANTS.BUDGETS.BASE);
}
